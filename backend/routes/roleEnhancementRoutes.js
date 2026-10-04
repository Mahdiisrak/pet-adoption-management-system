const express = require("express");
const oracledb = require("oracledb");
const bcrypt = require("bcryptjs");
const { getConnection } = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

const requireRole = (req, res, roles) => {
  if (!roles.includes(req.user.role)) {
    res.status(403).json({ success: false, message: `${roles.join(" or ")} access required` });
    return false;
  }
  return true;
};

const makeId = (prefix) => {
  const tail = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
  return `${prefix}${tail}`.slice(0, 12).toUpperCase();
};

const close = async (connection) => {
  if (connection) {
    try { await connection.close(); } catch (e) { console.error("Connection close error:", e); }
  }
};

// SQL VIEW-backed person/staff/salary information for Supervisor
router.get("/supervisor/views/:name", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["SUPERVISOR", "ADMIN"])) return;
  const views = {
    persons: "V_SUPERVISOR_PERSON_INFO",
    staff: "V_SUPERVISOR_STAFF_INFO",
    salaries: "V_SUPERVISOR_SALARY_HISTORY",
  };
  const viewName = views[String(req.params.name || "").toLowerCase()];
  if (!viewName) return res.status(400).json({ success: false, message: "Unknown view" });
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`SELECT * FROM ${viewName}`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load SQL view", error: error.message });
  } finally { await close(connection); }
});

// Supervisor adds Doctor: PERSON -> PERSON_PHONE -> EMPLOYEE -> DOCTOR -> SYSTEM_USER
router.post("/supervisor/doctors", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["SUPERVISOR", "ADMIN"])) return;
  let connection;
  try {
    const {
      personId, userId, firstName, lastName, gender, email, address, dateOfBirth, phoneNo,
      hireDate, licenseNo, specialization, salary, username, password,
    } = req.body;
    if (!personId || !userId || !firstName || !lastName || !licenseNo || !username || !password) {
      return res.status(400).json({ success: false, message: "personId, userId, firstName, lastName, licenseNo, username and password are required" });
    }
    if (String(password).length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    connection = await getConnection();
    const duplicate = await connection.execute(
      `SELECT
         (SELECT COUNT(*) FROM PERSON WHERE PERSON_ID=:personId) PERSON_COUNT,
         (SELECT COUNT(*) FROM SYSTEM_USER WHERE USER_ID=:userId OR UPPER(USERNAME)=UPPER(:username)) USER_COUNT,
         (SELECT COUNT(*) FROM DOCTOR WHERE LICENSE_NO=:licenseNo) LICENSE_COUNT
       FROM DUAL`,
      { personId: personId.toUpperCase(), userId: userId.toUpperCase(), username, licenseNo },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const d = duplicate.rows[0];
    if (d.PERSON_COUNT || d.USER_COUNT || d.LICENSE_COUNT) {
      return res.status(409).json({ success: false, message: "Person/User/Username/License already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await connection.execute(
      `INSERT INTO PERSON (PERSON_ID,FIRST_NAME,LAST_NAME,EMAIL,ADDRESS,DATE_OF_BIRTH,GENDER)
       VALUES (:personId,:firstName,:lastName,:email,:address,TO_DATE(:dateOfBirth,'YYYY-MM-DD'),:gender)`,
      { personId: personId.toUpperCase(), firstName, lastName, email: email || null, address: address || null, dateOfBirth: dateOfBirth || null, gender: gender || null }
    );
    if (phoneNo && String(phoneNo).trim()) {
      await connection.execute(`INSERT INTO PERSON_PHONE (PERSON_ID,PHONE_NO) VALUES (:personId,:phoneNo)`, { personId: personId.toUpperCase(), phoneNo: String(phoneNo).trim() });
    }
    await connection.execute(
      `INSERT INTO EMPLOYEE (EMPLOYEE_ID,HIRE_DATE,JOB_TITLE,EMPLOYMENT_STATUS,SALARY)
       VALUES (:id,TO_DATE(:hireDate,'YYYY-MM-DD'),'Veterinarian','ACTIVE',:salary)`,
      { id: personId.toUpperCase(), hireDate: hireDate || new Date().toISOString().slice(0, 10), salary: salary || null }
    );
    await connection.execute(
      `INSERT INTO DOCTOR (DOCTOR_ID,LICENSE_NO,SPECIALIZATION,SALARY)
       VALUES (:id,:licenseNo,:specialization,:salary)`,
      { id: personId.toUpperCase(), licenseNo, specialization: specialization || null, salary: salary || null }
    );
    await connection.execute(
      `INSERT INTO SYSTEM_USER (USER_ID,PERSON_ID,USERNAME,PASSWORD_HASH,USER_ROLE,USER_STATUS)
       VALUES (:userId,:personId,:username,:passwordHash,'DOCTOR','ACTIVE')`,
      { userId: userId.toUpperCase(), personId: personId.toUpperCase(), username, passwordHash }
    );
    await connection.commit();
    res.status(201).json({ success: true, message: "Doctor and doctor login created successfully" });
  } catch (error) {
    if (connection) try { await connection.rollback(); } catch {}
    res.status(500).json({ success: false, message: "Failed to create doctor", error: error.message });
  } finally { await close(connection); }
});

// Supervisor adds Volunteer. Volunteer is not an application login role.
router.post("/supervisor/volunteers", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["SUPERVISOR", "ADMIN"])) return;
  let connection;
  try {
    const { personId, firstName, lastName, gender, email, address, dateOfBirth, phoneNo, joinDate, availability, skills } = req.body;
    if (!personId || !firstName || !lastName) return res.status(400).json({ success: false, message: "personId, firstName and lastName are required" });
    const av = (availability || "AVAILABLE").toUpperCase();
    if (!["AVAILABLE", "UNAVAILABLE", "ON_DUTY"].includes(av)) return res.status(400).json({ success: false, message: "Invalid volunteer availability" });
    connection = await getConnection();
    const exists = await connection.execute(`SELECT COUNT(*) CNT FROM PERSON WHERE PERSON_ID=:id`, { id: personId.toUpperCase() }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (exists.rows[0].CNT) return res.status(409).json({ success: false, message: "Person ID already exists" });
    await connection.execute(
      `INSERT INTO PERSON (PERSON_ID,FIRST_NAME,LAST_NAME,EMAIL,ADDRESS,DATE_OF_BIRTH,GENDER)
       VALUES (:personId,:firstName,:lastName,:email,:address,TO_DATE(:dateOfBirth,'YYYY-MM-DD'),:gender)`,
      { personId: personId.toUpperCase(), firstName, lastName, email: email || null, address: address || null, dateOfBirth: dateOfBirth || null, gender: gender || null }
    );
    if (phoneNo && String(phoneNo).trim()) {
      await connection.execute(`INSERT INTO PERSON_PHONE (PERSON_ID,PHONE_NO) VALUES (:personId,:phoneNo)`, { personId: personId.toUpperCase(), phoneNo: String(phoneNo).trim() });
    }
    await connection.execute(
      `INSERT INTO VOLUNTEER (VOLUNTEER_ID,JOIN_DATE,AVAILABILITY,SKILLS)
       VALUES (:id,TO_DATE(:joinDate,'YYYY-MM-DD'),:availability,:skills)`,
      { id: personId.toUpperCase(), joinDate: joinDate || new Date().toISOString().slice(0, 10), availability: av, skills: skills || null }
    );
    await connection.commit();
    res.status(201).json({ success: true, message: "Volunteer created successfully" });
  } catch (error) {
    if (connection) try { await connection.rollback(); } catch {}
    res.status(500).json({ success: false, message: "Failed to create volunteer", error: error.message });
  } finally { await close(connection); }
});

const STATUS_MAP = {
  PET: { table: "PET", id: "PET_ID", col: "PET_STATUS", allowed: ["AVAILABLE", "ADOPTED", "RESCUED", "TREATMENT", "GUEST"] },
  EMPLOYEE: { table: "EMPLOYEE", id: "EMPLOYEE_ID", col: "EMPLOYMENT_STATUS", allowed: ["ACTIVE", "INACTIVE", "ON_LEAVE"] },
  VOLUNTEER: { table: "VOLUNTEER", id: "VOLUNTEER_ID", col: "AVAILABILITY", allowed: ["AVAILABLE", "UNAVAILABLE", "ON_DUTY"] },
  LOCAL_PET: { table: "LOCAL_PET", id: "LOCAL_PET_ID", col: "ADOPTION_STATUS", allowed: ["AVAILABLE", "PENDING", "ADOPTED", "NOT_AVAILABLE"] },
  GUEST_PET: { table: "GUEST_PET", id: "GUEST_PET_ID", col: "GUEST_STATUS", allowed: ["CHECKED_IN", "CHECKED_OUT", "EXTENDED"] },
  SHELTER: { table: "SHELTER", id: "SHELTER_ID", col: "SHELTER_STATUS", allowed: ["ACTIVE", "INACTIVE", "MAINTENANCE"] },
  ADOPTION: { table: "ADOPTION_PROCESS", id: "ADOPTION_ID", col: "ADOPTION_STATUS", allowed: ["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"] },
  RESCUE: { table: "RESCUE", id: "RESCUE_ID", col: "RESCUE_STATUS", allowed: ["ACTIVE", "COMPLETED", "CANCELLED"] },
  SALARY: { table: "SALARY", id: "SALARY_ID", col: "SALARY_STATUS", allowed: ["PENDING", "PAID", "CANCELLED"] },
  ADOPTER: { table: "ADOPTER", id: "ADOPTER_ID", col: "ADOPTER_STATUS", allowed: ["ACTIVE", "INACTIVE", "BLOCKED"] },
  SYSTEM_USER: { table: "SYSTEM_USER", id: "USER_ID", col: "USER_STATUS", allowed: ["ACTIVE", "INACTIVE", "BLOCKED"] },
};

router.patch("/supervisor/status/:entity/:id", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["SUPERVISOR", "ADMIN"])) return;
  const key = String(req.params.entity || "").toUpperCase();
  const cfg = STATUS_MAP[key];
  const status = String(req.body.status || "").toUpperCase();
  if (!cfg) return res.status(400).json({ success: false, message: "Unsupported status entity" });
  if (!cfg.allowed.includes(status)) return res.status(400).json({ success: false, message: `Allowed: ${cfg.allowed.join(", ")}` });
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `UPDATE ${cfg.table} SET ${cfg.col}=:status WHERE ${cfg.id}=:id`,
      { status, id: req.params.id.toUpperCase() },
      { autoCommit: true }
    );
    if (!result.rowsAffected) return res.status(404).json({ success: false, message: "Record not found" });
    res.json({ success: true, message: `${key} status updated`, status });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  finally { await close(connection); }
});

router.post("/supervisor/salary-payments", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["SUPERVISOR", "ADMIN"])) return;
  let connection;
  try {
    const receiverType = String(req.body.receiverType || "").toUpperCase();
    const receiverId = String(req.body.receiverId || "").toUpperCase();
    const amount = Number(req.body.amount);
    const salaryDate = req.body.salaryDate || new Date().toISOString().slice(0, 10);
    const receiverMap = { EMPLOYEE: "EMPLOYEE", SUPERVISOR: "SUPERVISOR", DOCTOR: "DOCTOR" };
    if (!receiverMap[receiverType] || !receiverId || !(amount > 0)) return res.status(400).json({ success: false, message: "receiverType, receiverId and positive amount are required" });
    connection = await getConnection();
    const idColumn = `${receiverType}_ID`;
    const check = await connection.execute(`SELECT COUNT(*) CNT FROM ${receiverMap[receiverType]} WHERE ${idColumn}=:id`, { id: receiverId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!check.rows[0].CNT) return res.status(404).json({ success: false, message: "Salary receiver not found" });
    const expenseId = makeId("EX");
    const salaryId = makeId("SL");
    await connection.execute(
      `INSERT INTO EXPENSE (EXPENSE_ID,EXPENSE_DATE,SOURCE_NAME,AMOUNT,EXPENSE_DESCRIPTION,EXPENSE_STATUS)
       VALUES (:expenseId,TO_DATE(:salaryDate,'YYYY-MM-DD'),'SALARY',:amount,:description,'PAID')`,
      { expenseId, salaryDate, amount, description: `Salary paid to ${receiverType} ${receiverId}` }
    );
    const ids = { employeeId: null, supervisorId: null, doctorId: null };
    if (receiverType === "EMPLOYEE") ids.employeeId = receiverId;
    if (receiverType === "SUPERVISOR") ids.supervisorId = receiverId;
    if (receiverType === "DOCTOR") ids.doctorId = receiverId;
    await connection.execute(
      `INSERT INTO SALARY (SALARY_ID,EMPLOYEE_ID,SUPERVISOR_ID,DOCTOR_ID,EXPENSE_ID,SALARY_DATE,SALARY_AMOUNT,SALARY_STATUS)
       VALUES (:salaryId,:employeeId,:supervisorId,:doctorId,:expenseId,TO_DATE(:salaryDate,'YYYY-MM-DD'),:amount,'PAID')`,
      { salaryId, ...ids, expenseId, salaryDate, amount }
    );
    await connection.commit();
    res.status(201).json({ success: true, message: "Salary payment recorded", salaryId, expenseId });
  } catch (error) {
    if (connection) try { await connection.rollback(); } catch {}
    res.status(500).json({ success: false, message: "Failed to record salary", error: error.message });
  } finally { await close(connection); }
});

router.post("/supervisor/medicine-expenses", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["SUPERVISOR", "ADMIN"])) return;
  let connection;
  try {
    const medicineId = String(req.body.medicineId || "").toUpperCase();
    const amount = Number(req.body.amount);
    const quantity = Number(req.body.quantity || 0);
    const expenseDate = req.body.expenseDate || new Date().toISOString().slice(0, 10);
    if (!medicineId || !(amount > 0) || quantity < 0) return res.status(400).json({ success: false, message: "medicineId, positive amount and valid quantity are required" });
    connection = await getConnection();
    const med = await connection.execute(`SELECT MEDICINE_NAME FROM MEDICINE WHERE MEDICINE_ID=:id`, { id: medicineId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!med.rows.length) return res.status(404).json({ success: false, message: "Medicine not found" });
    const expenseId = makeId("EX");
    await connection.execute(
      `INSERT INTO EXPENSE (EXPENSE_ID,EXPENSE_DATE,SOURCE_NAME,AMOUNT,EXPENSE_DESCRIPTION,EXPENSE_STATUS)
       VALUES (:expenseId,TO_DATE(:expenseDate,'YYYY-MM-DD'),'MEDICAL',:amount,:description,'PAID')`,
      { expenseId, expenseDate, amount, description: `Medicine expense ${medicineId} - ${med.rows[0].MEDICINE_NAME}${req.body.description ? ` - ${req.body.description}` : ""}` }
    );
    if (quantity > 0) await connection.execute(`UPDATE MEDICINE SET STOCK_QUANTITY=NVL(STOCK_QUANTITY,0)+:quantity WHERE MEDICINE_ID=:id`, { quantity, id: medicineId });
    await connection.commit();
    res.status(201).json({ success: true, message: "Medicine expense recorded", expenseId });
  } catch (error) {
    if (connection) try { await connection.rollback(); } catch {}
    res.status(500).json({ success: false, message: "Failed to record medicine expense", error: error.message });
  } finally { await close(connection); }
});

// Doctor pet management
router.get("/doctor/pets", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["DOCTOR", "ADMIN"])) return;
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`SELECT * FROM PET ORDER BY PET_ID`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ success: true, data: result.rows });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  finally { await close(connection); }
});

router.patch("/doctor/pets/:id", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["DOCTOR", "ADMIN"])) return;
  const map = {
    petName: "PET_NAME", species: "SPECIES", breed: "BREED", gender: "GENDER",
    dateOfBirth: "DATE_OF_BIRTH", color: "COLOR", weight: "WEIGHT", petStatus: "PET_STATUS",
  };
  const sets = [];
  const binds = { id: req.params.id.toUpperCase() };
  for (const [key, col] of Object.entries(map)) {
    if (req.body[key] !== undefined) {
      if (key === "dateOfBirth") sets.push(`${col}=TO_DATE(:${key},'YYYY-MM-DD')`);
      else sets.push(`${col}=:${key}`);
      binds[key] = req.body[key] === "" ? null : req.body[key];
    }
  }
  if (req.body.petStatus && !["AVAILABLE", "ADOPTED", "RESCUED", "TREATMENT", "GUEST"].includes(String(req.body.petStatus).toUpperCase())) {
    return res.status(400).json({ success: false, message: "Invalid pet status" });
  }
  if (binds.petStatus) binds.petStatus = String(binds.petStatus).toUpperCase();
  if (!sets.length) return res.status(400).json({ success: false, message: "No pet fields supplied" });
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`UPDATE PET SET ${sets.join(", ")} WHERE PET_ID=:id`, binds, { autoCommit: true });
    if (!result.rowsAffected) return res.status(404).json({ success: false, message: "Pet not found" });
    res.json({ success: true, message: "Pet updated successfully" });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  finally { await close(connection); }
});

router.post("/doctor/medical-records", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["DOCTOR"])) return;
  let connection;
  try {
    const recordId = (req.body.recordId || makeId("MR")).toUpperCase();
    if (!req.body.petId) return res.status(400).json({ success: false, message: "petId is required" });
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO MEDICAL_RECORD (RECORD_ID,PET_ID,DOCTOR_ID,RECORD_DATE,DIAGNOSIS,TREATMENT,HEALTH_STATUS)
       VALUES (:recordId,:petId,:doctorId,TO_DATE(:recordDate,'YYYY-MM-DD'),:diagnosis,:treatment,:healthStatus)`,
      { recordId, petId: req.body.petId.toUpperCase(), doctorId: req.user.personId, recordDate: req.body.recordDate || new Date().toISOString().slice(0, 10), diagnosis: req.body.diagnosis || null, treatment: req.body.treatment || null, healthStatus: req.body.healthStatus || null },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: "Medical record created", recordId });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  finally { await close(connection); }
});

router.patch("/doctor/medical-records/:id", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["DOCTOR"])) return;
  const map = { diagnosis: "DIAGNOSIS", treatment: "TREATMENT", healthStatus: "HEALTH_STATUS" };
  const sets = [];
  const binds = { id: req.params.id.toUpperCase(), doctorId: req.user.personId };
  for (const [key, col] of Object.entries(map)) if (req.body[key] !== undefined) { sets.push(`${col}=:${key}`); binds[key] = req.body[key] || null; }
  if (!sets.length) return res.status(400).json({ success: false, message: "No medical fields supplied" });
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`UPDATE MEDICAL_RECORD SET ${sets.join(", ")} WHERE RECORD_ID=:id AND DOCTOR_ID=:doctorId`, binds, { autoCommit: true });
    if (!result.rowsAffected) return res.status(404).json({ success: false, message: "Medical record not found or not owned by this doctor" });
    res.json({ success: true, message: "Medical record updated" });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  finally { await close(connection); }
});

router.post("/doctor/vaccinations", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["DOCTOR"])) return;
  let connection;
  try {
    const { recordId, vaccineName, vaccinationDate, nextDueDate, vaccinePrice, vaccinationStatus } = req.body;
    if (!recordId || !vaccineName || !vaccinationDate) return res.status(400).json({ success: false, message: "recordId, vaccineName and vaccinationDate are required" });
    const status = String(vaccinationStatus || "COMPLETED").toUpperCase();
    if (!["SCHEDULED", "COMPLETED", "MISSED", "CANCELLED"].includes(status)) return res.status(400).json({ success: false, message: "Invalid vaccination status" });
    connection = await getConnection();
    const own = await connection.execute(`SELECT COUNT(*) CNT FROM MEDICAL_RECORD WHERE RECORD_ID=:recordId AND DOCTOR_ID=:doctorId`, { recordId: recordId.toUpperCase(), doctorId: req.user.personId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!own.rows[0].CNT) return res.status(403).json({ success: false, message: "Medical record does not belong to this doctor" });
    const vaccinationId = (req.body.vaccinationId || makeId("VC")).toUpperCase();
    await connection.execute(
      `INSERT INTO VACCINATION (VACCINATION_ID,RECORD_ID,VACCINE_NAME,VACCINATION_DATE,NEXT_DUE_DATE,VACCINATION_STATUS,VACCINE_PRICE)
       VALUES (:id,:recordId,:name,TO_DATE(:vaccinationDate,'YYYY-MM-DD'),TO_DATE(:nextDueDate,'YYYY-MM-DD'),:status,:price)`,
      { id: vaccinationId, recordId: recordId.toUpperCase(), name: vaccineName, vaccinationDate, nextDueDate: nextDueDate || null, status, price: vaccinePrice || null },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: "Vaccination created", vaccinationId });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  finally { await close(connection); }
});

router.patch("/doctor/vaccinations/:id/status", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["DOCTOR"])) return;
  const status = String(req.body.status || "").toUpperCase();
  if (!["SCHEDULED", "COMPLETED", "MISSED", "CANCELLED"].includes(status)) return res.status(400).json({ success: false, message: "Invalid vaccination status" });
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `UPDATE VACCINATION
       SET VACCINATION_STATUS=:status
       WHERE VACCINATION_ID=:id
         AND RECORD_ID IN (SELECT RECORD_ID FROM MEDICAL_RECORD WHERE DOCTOR_ID=:doctorId)`,
      { status, id: req.params.id.toUpperCase(), doctorId: req.user.personId },
      { autoCommit: true }
    );
    if (!result.rowsAffected) return res.status(404).json({ success: false, message: "Vaccination not found" });
    res.json({ success: true, message: "Vaccination status updated" });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  finally { await close(connection); }
});

router.post("/doctor/medicines", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["DOCTOR", "ADMIN"])) return;
  let connection;
  try {
    const { medicineName, medicineType, price, stockQuantity, expiryDate } = req.body;
    if (!medicineName || price === undefined || price === "") return res.status(400).json({ success: false, message: "medicineName and price are required" });
    if (Number(price) < 0 || Number(stockQuantity || 0) < 0) return res.status(400).json({ success: false, message: "Price and stock cannot be negative" });
    const medicineId = (req.body.medicineId || makeId("MD")).toUpperCase();
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO MEDICINE (MEDICINE_ID,MEDICINE_NAME,MEDICINE_TYPE,PRICE,STOCK_QUANTITY,EXPIRY_DATE)
       VALUES (:medicineId,:medicineName,:medicineType,:price,:stockQuantity,TO_DATE(:expiryDate,'YYYY-MM-DD'))`,
      { medicineId, medicineName, medicineType: medicineType || null, price, stockQuantity: stockQuantity || 0, expiryDate: expiryDate || null },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: "Medicine created", medicineId });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to create medicine", error: error.message }); }
  finally { await close(connection); }
});

router.patch("/doctor/medicines/:id", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["DOCTOR", "ADMIN"])) return;
  const map = { medicineName: "MEDICINE_NAME", medicineType: "MEDICINE_TYPE", price: "PRICE", stockQuantity: "STOCK_QUANTITY", expiryDate: "EXPIRY_DATE" };
  const sets = [];
  const binds = { id: req.params.id.toUpperCase() };
  for (const [key, col] of Object.entries(map)) {
    if (req.body[key] !== undefined) {
      sets.push(key === "expiryDate" ? `${col}=TO_DATE(:${key},'YYYY-MM-DD')` : `${col}=:${key}`);
      binds[key] = req.body[key] === "" ? null : req.body[key];
    }
  }
  if (!sets.length) return res.status(400).json({ success: false, message: "No medicine fields supplied" });
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`UPDATE MEDICINE SET ${sets.join(", ")} WHERE MEDICINE_ID=:id`, binds, { autoCommit: true });
    if (!result.rowsAffected) return res.status(404).json({ success: false, message: "Medicine not found" });
    res.json({ success: true, message: "Medicine updated" });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  finally { await close(connection); }
});

router.post("/doctor/prescriptions", authenticateToken, async (req, res) => {
  if (!requireRole(req, res, ["DOCTOR"])) return;
  let connection;
  try {
    const { recordId, medicineId, dosage, frequency, durationDays, instructions } = req.body;
    if (!recordId || !medicineId || !dosage) return res.status(400).json({ success: false, message: "recordId, medicineId and dosage are required" });
    connection = await getConnection();
    const own = await connection.execute(`SELECT COUNT(*) CNT FROM MEDICAL_RECORD WHERE RECORD_ID=:recordId AND DOCTOR_ID=:doctorId`, { recordId: recordId.toUpperCase(), doctorId: req.user.personId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!own.rows[0].CNT) return res.status(403).json({ success: false, message: "Medical record does not belong to this doctor" });
    await connection.execute(
      `INSERT INTO PRESCRIPTION (RECORD_ID,MEDICINE_ID,DOSAGE,FREQUENCY,DURATION_DAYS,INSTRUCTIONS)
       VALUES (:recordId,:medicineId,:dosage,:frequency,:durationDays,:instructions)`,
      { recordId: recordId.toUpperCase(), medicineId: medicineId.toUpperCase(), dosage, frequency: frequency || null, durationDays: durationDays || null, instructions: instructions || null },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: "Prescription created" });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  finally { await close(connection); }
});

module.exports = router;