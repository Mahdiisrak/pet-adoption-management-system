param(
  [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
Write-Host "Project root: $ProjectRoot" -ForegroundColor Cyan

$required = @(
  "backend\server.js",
  "backend\config\database.js",
  "backend\middleware\authenticateToken.js",
  "frontend\src\App.jsx",
  "frontend\src\layouts\DashboardLayout.jsx"
)
foreach ($rel in $required) {
  $full = Join-Path $ProjectRoot $rel
  if (-not (Test-Path $full)) { throw "Required file not found: $full" }
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = Join-Path $ProjectRoot "_upgrade_backup_$stamp"
New-Item -ItemType Directory -Force -Path $backup | Out-Null
Copy-Item (Join-Path $ProjectRoot "backend\server.js") $backup
Copy-Item (Join-Path $ProjectRoot "frontend\src\App.jsx") $backup
Copy-Item (Join-Path $ProjectRoot "frontend\src\layouts\DashboardLayout.jsx") $backup
Write-Host "Backup created: $backup" -ForegroundColor DarkGray

New-Item -ItemType Directory -Force -Path (Join-Path $ProjectRoot "backend\routes") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ProjectRoot "frontend\src\pages\supervisor") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ProjectRoot "frontend\src\pages\doctor") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ProjectRoot "database") | Out-Null

$routeCode = @'
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
'@
$applyCode = @'
const path = require("path");
const oracledb = require("oracledb");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { getConnection } = require("./config/database");

async function columnExists(connection, table, column) {
  const r = await connection.execute(
    `SELECT COUNT(*) CNT FROM USER_TAB_COLUMNS WHERE TABLE_NAME=:tableName AND COLUMN_NAME=:columnName`,
    { tableName: table.toUpperCase(), columnName: column.toUpperCase() },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return Number(r.rows[0].CNT) > 0;
}

async function tableExists(connection, table) {
  const r = await connection.execute(
    `SELECT COUNT(*) CNT FROM USER_TABLES WHERE TABLE_NAME=:tableName`,
    { tableName: table.toUpperCase() },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return Number(r.rows[0].CNT) > 0;
}

async function addColumnIfMissing(connection, table, column, definition) {
  if (!(await columnExists(connection, table, column))) {
    await connection.execute(`ALTER TABLE ${table} ADD ${column} ${definition}`);
    console.log(`Added ${table}.${column}`);
  } else {
    console.log(`OK ${table}.${column}`);
  }
}

async function renameIfNeeded(connection, table, oldColumn, newColumn) {
  const hasOld = await columnExists(connection, table, oldColumn);
  const hasNew = await columnExists(connection, table, newColumn);
  if (hasOld && !hasNew) {
    await connection.execute(`ALTER TABLE ${table} RENAME COLUMN ${oldColumn} TO ${newColumn}`);
    console.log(`Renamed ${table}.${oldColumn} -> ${newColumn}`);
  } else if (hasNew) {
    console.log(`OK ${table}.${newColumn}`);
  }
}

async function main() {
  let connection;
  try {
    connection = await getConnection();

    for (const required of ["PERSON", "PERSON_PHONE", "EMPLOYEE", "SUPERVISOR", "DOCTOR", "VOLUNTEER", "PET", "MEDICAL_RECORD", "VACCINATION", "MEDICINE", "PRESCRIPTION", "EXPENSE", "SALARY", "SYSTEM_USER"]) {
      if (!(await tableExists(connection, required))) {
        throw new Error(`Required table ${required} not found. Run the final schema/migration first.`);
      }
    }
    for (const requiredCol of ["FIRST_NAME", "LAST_NAME"]) {
      if (!(await columnExists(connection, "PERSON", requiredCol))) {
        throw new Error(`PERSON.${requiredCol} is missing. Your database is still on the old PERSON structure.`);
      }
    }

    await addColumnIfMissing(connection, "EMPLOYEE", "SALARY", "NUMBER(12,2)");
    await addColumnIfMissing(connection, "SUPERVISOR", "SALARY", "NUMBER(12,2)");
    await addColumnIfMissing(connection, "DOCTOR", "SALARY", "NUMBER(12,2)");
    await addColumnIfMissing(connection, "VOLUNTEER", "SKILLS", "VARCHAR2(200)");
    await addColumnIfMissing(connection, "VACCINATION", "VACCINE_PRICE", "NUMBER(12,2)");

    await renameIfNeeded(connection, "MEDICINE", "UNIT_PRICE", "PRICE");
    await renameIfNeeded(connection, "MEDICAL_RECORD", "NOTES", "HEALTH_STATUS");
    await renameIfNeeded(connection, "EXPENSE", "EXPENSE_TYPE", "SOURCE_NAME");

    for (const [table, col] of [["MEDICINE","PRICE"],["MEDICAL_RECORD","HEALTH_STATUS"],["EXPENSE","SOURCE_NAME"]]) {
      if (!(await columnExists(connection, table, col))) throw new Error(`${table}.${col} is required but missing.`);
    }

    const ddls = [
`CREATE OR REPLACE VIEW V_SUPERVISOR_PERSON_INFO AS
 SELECT p.PERSON_ID,
        p.FIRST_NAME,
        p.LAST_NAME,
        TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS FULL_NAME,
        (SELECT LISTAGG(pp.PHONE_NO, ', ') WITHIN GROUP (ORDER BY pp.PHONE_NO)
           FROM PERSON_PHONE pp WHERE pp.PERSON_ID=p.PERSON_ID) AS PHONE_NO,
        p.EMAIL, p.ADDRESS, p.DATE_OF_BIRTH, p.GENDER,
        CASE WHEN p.DATE_OF_BIRTH IS NULL THEN NULL
             ELSE TRUNC(MONTHS_BETWEEN(SYSDATE,p.DATE_OF_BIRTH)/12) END AS AGE
   FROM PERSON p`,
`CREATE OR REPLACE VIEW V_SUPERVISOR_STAFF_INFO AS
 SELECT p.PERSON_ID,
        TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS FULL_NAME,
        (SELECT LISTAGG(pp.PHONE_NO, ', ') WITHIN GROUP (ORDER BY pp.PHONE_NO)
           FROM PERSON_PHONE pp WHERE pp.PERSON_ID=p.PERSON_ID) AS PHONE_NO,
        p.EMAIL,
        CASE WHEN s.SUPERVISOR_ID IS NOT NULL THEN 'SUPERVISOR'
             WHEN d.DOCTOR_ID IS NOT NULL THEN 'DOCTOR'
             WHEN e.EMPLOYEE_ID IS NOT NULL THEN 'EMPLOYEE'
             WHEN v.VOLUNTEER_ID IS NOT NULL THEN 'VOLUNTEER' END AS STAFF_ROLE,
        e.HIRE_DATE, e.JOB_TITLE, e.EMPLOYMENT_STATUS,
        s.ASSIGNED_DATE, d.LICENSE_NO, d.SPECIALIZATION,
        v.JOIN_DATE, v.AVAILABILITY, v.SKILLS,
        CASE WHEN s.SUPERVISOR_ID IS NOT NULL THEN s.SALARY
             WHEN d.DOCTOR_ID IS NOT NULL THEN d.SALARY
             ELSE e.SALARY END AS CURRENT_SALARY
   FROM PERSON p
   LEFT JOIN EMPLOYEE e ON e.EMPLOYEE_ID=p.PERSON_ID
   LEFT JOIN SUPERVISOR s ON s.SUPERVISOR_ID=p.PERSON_ID
   LEFT JOIN DOCTOR d ON d.DOCTOR_ID=p.PERSON_ID
   LEFT JOIN VOLUNTEER v ON v.VOLUNTEER_ID=p.PERSON_ID
  WHERE e.EMPLOYEE_ID IS NOT NULL OR s.SUPERVISOR_ID IS NOT NULL
     OR d.DOCTOR_ID IS NOT NULL OR v.VOLUNTEER_ID IS NOT NULL`,
`CREATE OR REPLACE VIEW V_SUPERVISOR_SALARY_HISTORY AS
 SELECT sa.SALARY_ID,
        CASE WHEN sa.EMPLOYEE_ID IS NOT NULL THEN 'EMPLOYEE'
             WHEN sa.SUPERVISOR_ID IS NOT NULL THEN 'SUPERVISOR'
             WHEN sa.DOCTOR_ID IS NOT NULL THEN 'DOCTOR' END AS RECEIVER_TYPE,
        NVL(sa.EMPLOYEE_ID,NVL(sa.SUPERVISOR_ID,sa.DOCTOR_ID)) AS RECEIVER_ID,
        TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS RECEIVER_NAME,
        sa.SALARY_DATE, sa.SALARY_AMOUNT, sa.SALARY_STATUS,
        sa.EXPENSE_ID, ex.SOURCE_NAME, ex.EXPENSE_DESCRIPTION, ex.EXPENSE_STATUS
   FROM SALARY sa
   JOIN PERSON p ON p.PERSON_ID=NVL(sa.EMPLOYEE_ID,NVL(sa.SUPERVISOR_ID,sa.DOCTOR_ID))
   JOIN EXPENSE ex ON ex.EXPENSE_ID=sa.EXPENSE_ID`
    ];
    for (const ddl of ddls) await connection.execute(ddl);
    console.log("Created/updated 3 Supervisor SQL VIEWs");
    console.log("Database role upgrade complete.");
  } finally {
    if (connection) await connection.close();
  }
}

main().catch((e) => {
  console.error("Role upgrade failed:", e.message);
  process.exit(1);
});
'@
$supervisorPage = @'
import { useState } from "react";
import api from "../../services/api";

function Fields({ names }) {
  return names.map((f) => (
    <div className="col-md-4" key={f.name}>
      <label className="form-label">{f.label}</label>
      {f.type === "select" ? (
        <select className="form-select" name={f.name} defaultValue={f.defaultValue || ""} required={f.required}>
          <option value="">Select</option>
          {f.options.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      ) : (
        <input className="form-control" name={f.name} type={f.type || "text"} required={f.required} defaultValue={f.defaultValue || ""} />
      )}
    </div>
  ));
}

function FormCard({ title, fields, button, onSubmit }) {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h5 className="fw-bold mb-3">{title}</h5>
        <form onSubmit={onSubmit}>
          <div className="row g-3"><Fields names={fields} /></div>
          <button className="btn btn-primary mt-3" type="submit">{button}</button>
        </form>
      </div>
    </div>
  );
}

export default function SupervisorOperationsPage() {
  const [message, setMessage] = useState("");
  const [viewRows, setViewRows] = useState([]);
  const [viewName, setViewName] = useState("");

  const post = (url) => async (e) => {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      const r = await api.post(url, data);
      setMessage(r.data.message || "Saved");
      e.currentTarget.reset();
    } catch (err) { setMessage(err.response?.data?.message || err.message); }
  };

  const updateStatus = async (e) => {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      const r = await api.patch(`/supervisor/status/${data.entity}/${data.id}`, { status: data.status });
      setMessage(r.data.message || "Status updated");
    } catch (err) { setMessage(err.response?.data?.message || err.message); }
  };

  const loadView = async (name) => {
    try {
      const r = await api.get(`/supervisor/views/${name}`);
      setViewRows(r.data.data || []);
      setViewName(name);
      setMessage("");
    } catch (err) { setMessage(err.response?.data?.message || err.message); }
  };

  const doctorFields = [
    { name: "personId", label: "Person ID", required: true }, { name: "userId", label: "User ID", required: true },
    { name: "firstName", label: "First Name", required: true }, { name: "lastName", label: "Last Name", required: true },
    { name: "gender", label: "Gender", type: "select", options: ["MALE", "FEMALE", "UNKNOWN"] }, { name: "email", label: "Email", type: "email" },
    { name: "phoneNo", label: "Phone" }, { name: "address", label: "Address" }, { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "hireDate", label: "Hire Date", type: "date" }, { name: "licenseNo", label: "License No", required: true },
    { name: "specialization", label: "Specialization" }, { name: "salary", label: "Salary", type: "number" },
    { name: "username", label: "Username", required: true }, { name: "password", label: "Password", type: "password", required: true },
  ];
  const volunteerFields = [
    { name: "personId", label: "Person ID", required: true }, { name: "firstName", label: "First Name", required: true },
    { name: "lastName", label: "Last Name", required: true }, { name: "gender", label: "Gender", type: "select", options: ["MALE", "FEMALE", "UNKNOWN"] },
    { name: "email", label: "Email", type: "email" }, { name: "phoneNo", label: "Phone" }, { name: "address", label: "Address" },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" }, { name: "joinDate", label: "Join Date", type: "date" },
    { name: "availability", label: "Availability", type: "select", options: ["AVAILABLE", "UNAVAILABLE", "ON_DUTY"], defaultValue: "AVAILABLE" },
    { name: "skills", label: "Skills" },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4"><div><h2 className="fw-bold mb-1">Supervisor Operations</h2><p className="text-secondary mb-0">Add staff, SQL views, status, salary and medicine expense.</p></div></div>
      {message && <div className="alert alert-info">{message}</div>}

      <div className="card border-0 shadow-sm mb-4"><div className="card-body">
        <h5 className="fw-bold">SQL Views</h5>
        <div className="d-flex gap-2 flex-wrap mb-3">
          <button className="btn btn-outline-primary" onClick={() => loadView("persons")}>View All Persons</button>
          <button className="btn btn-outline-primary" onClick={() => loadView("staff")}>View All Staff</button>
          <button className="btn btn-outline-primary" onClick={() => loadView("salaries")}>View Salary History</button>
        </div>
        {viewRows.length > 0 && <div className="table-responsive"><table className="table table-sm table-hover"><thead><tr>{Object.keys(viewRows[0]).map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{viewRows.map((row,i)=><tr key={i}>{Object.values(row).map((v,j)=><td key={j}>{v == null ? "-" : String(v)}</td>)}</tr>)}</tbody></table></div>}
        {viewName && !viewRows.length && <div className="text-secondary">No rows in {viewName} view.</div>}
      </div></div>

      <FormCard title="Add Doctor" fields={doctorFields} button="Create Doctor" onSubmit={post("/supervisor/doctors")} />
      <FormCard title="Add Volunteer" fields={volunteerFields} button="Create Volunteer" onSubmit={post("/supervisor/volunteers")} />
      <FormCard title="Record Salary Payment" button="Record Salary" onSubmit={post("/supervisor/salary-payments")} fields={[
        { name: "receiverType", label: "Receiver Type", type: "select", options: ["EMPLOYEE", "SUPERVISOR", "DOCTOR"], required: true },
        { name: "receiverId", label: "Receiver ID", required: true }, { name: "amount", label: "Amount", type: "number", required: true },
        { name: "salaryDate", label: "Payment Date", type: "date" },
      ]} />
      <FormCard title="Record Medicine Expense" button="Record Expense" onSubmit={post("/supervisor/medicine-expenses")} fields={[
        { name: "medicineId", label: "Medicine ID", required: true }, { name: "amount", label: "Expense Amount", type: "number", required: true },
        { name: "quantity", label: "Purchased Quantity", type: "number" }, { name: "expenseDate", label: "Expense Date", type: "date" },
        { name: "description", label: "Description" },
      ]} />
      <FormCard title="Update Status" button="Update Status" onSubmit={updateStatus} fields={[
        { name: "entity", label: "Entity", type: "select", options: ["PET", "EMPLOYEE", "VOLUNTEER", "LOCAL_PET", "GUEST_PET", "SHELTER", "ADOPTION", "RESCUE", "SALARY", "ADOPTER", "SYSTEM_USER"], required: true },
        { name: "id", label: "Record ID", required: true }, { name: "status", label: "New Status", required: true },
      ]} />
    </div>
  );
}
'@
$doctorPage = @'
import { useEffect, useState } from "react";
import api from "../../services/api";

function Fields({ fields }) {
  return fields.map((f) => (
    <div className="col-md-4" key={f.name}>
      <label className="form-label">{f.label}</label>
      {f.type === "select" ? (
        <select name={f.name} className="form-select" required={f.required} defaultValue="">
          <option value="">Select</option>{f.options.map(x => <option key={x} value={x}>{x}</option>)}
        </select>
      ) : <input name={f.name} type={f.type || "text"} className="form-control" required={f.required} />}
    </div>
  ));
}

function FormCard({ title, fields, button, onSubmit }) {
  return <div className="card border-0 shadow-sm mb-4"><div className="card-body"><h5 className="fw-bold mb-3">{title}</h5><form onSubmit={onSubmit}><div className="row g-3"><Fields fields={fields} /></div><button className="btn btn-primary mt-3">{button}</button></form></div></div>;
}

export default function DoctorOperationsPage() {
  const [pets, setPets] = useState([]);
  const [message, setMessage] = useState("");
  const loadPets = async () => {
    try { const r = await api.get("/doctor/pets"); setPets(r.data.data || []); }
    catch (err) { setMessage(err.response?.data?.message || err.message); }
  };
  useEffect(() => { loadPets(); }, []);

  const post = (url) => async (e) => {
    e.preventDefault();
    try { const data = Object.fromEntries(new FormData(e.currentTarget).entries()); const r = await api.post(url, data); setMessage(r.data.message || "Saved"); e.currentTarget.reset(); await loadPets(); }
    catch (err) { setMessage(err.response?.data?.message || err.message); }
  };
  const patchById = (base, idField) => async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const id = data[idField]; delete data[idField];
    Object.keys(data).forEach(k => data[k] === "" && delete data[k]);
    try { const r = await api.patch(`${base}/${id}`, data); setMessage(r.data.message || "Updated"); await loadPets(); }
    catch (err) { setMessage(err.response?.data?.message || err.message); }
  };

  return <div>
    <h2 className="fw-bold mb-1">Doctor Operations</h2><p className="text-secondary mb-4">Update pets and write medical data.</p>
    {message && <div className="alert alert-info">{message}</div>}

    <div className="card border-0 shadow-sm mb-4"><div className="card-body"><h5 className="fw-bold">Pets</h5><div className="table-responsive"><table className="table table-sm"><thead><tr><th>ID</th><th>Name</th><th>Species</th><th>Breed</th><th>Weight</th><th>Status</th></tr></thead><tbody>{pets.map(p => <tr key={p.PET_ID}><td>{p.PET_ID}</td><td>{p.PET_NAME}</td><td>{p.SPECIES}</td><td>{p.BREED || "-"}</td><td>{p.WEIGHT || "-"}</td><td>{p.PET_STATUS}</td></tr>)}</tbody></table></div></div></div>

    <FormCard title="Update Pet" button="Update Pet" onSubmit={patchById("/doctor/pets", "petId")} fields={[
      { name: "petId", label: "Pet ID", required: true }, { name: "petName", label: "Pet Name" }, { name: "species", label: "Species" },
      { name: "breed", label: "Breed" }, { name: "color", label: "Color" }, { name: "weight", label: "Weight", type: "number" },
      { name: "petStatus", label: "Status", type: "select", options: ["AVAILABLE", "ADOPTED", "RESCUED", "TREATMENT", "GUEST"] },
      { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    ]} />

    <FormCard title="Create Medical Record" button="Create Medical Record" onSubmit={post("/doctor/medical-records")} fields={[
      { name: "recordId", label: "Record ID (optional)" }, { name: "petId", label: "Pet ID", required: true }, { name: "recordDate", label: "Record Date", type: "date" },
      { name: "diagnosis", label: "Diagnosis" }, { name: "treatment", label: "Treatment" }, { name: "healthStatus", label: "Health Status" },
    ]} />

    <FormCard title="Update Medical Record" button="Update Medical Record" onSubmit={patchById("/doctor/medical-records", "recordId")} fields={[
      { name: "recordId", label: "Record ID", required: true }, { name: "diagnosis", label: "Diagnosis" }, { name: "treatment", label: "Treatment" }, { name: "healthStatus", label: "Health Status" },
    ]} />

    <FormCard title="Add Vaccination" button="Add Vaccination" onSubmit={post("/doctor/vaccinations")} fields={[
      { name: "vaccinationId", label: "Vaccination ID (optional)" }, { name: "recordId", label: "Medical Record ID", required: true },
      { name: "vaccineName", label: "Vaccine Name", required: true }, { name: "vaccinationDate", label: "Vaccination Date", type: "date", required: true },
      { name: "nextDueDate", label: "Next Due Date", type: "date" }, { name: "vaccinePrice", label: "Vaccine Price", type: "number" },
      { name: "vaccinationStatus", label: "Status", type: "select", options: ["SCHEDULED", "COMPLETED", "MISSED", "CANCELLED"] },
    ]} />

    <FormCard title="Update Vaccination Status" button="Update Vaccination Status" onSubmit={async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      try { const r = await api.patch(`/doctor/vaccinations/${data.vaccinationId}/status`, { status: data.status }); setMessage(r.data.message || "Updated"); e.currentTarget.reset(); }
      catch (err) { setMessage(err.response?.data?.message || err.message); }
    }} fields={[
      { name: "vaccinationId", label: "Vaccination ID", required: true },
      { name: "status", label: "Status", type: "select", options: ["SCHEDULED", "COMPLETED", "MISSED", "CANCELLED"], required: true },
    ]} />

    <FormCard title="Add Medicine" button="Add Medicine" onSubmit={post("/doctor/medicines")} fields={[
      { name: "medicineId", label: "Medicine ID (optional)" }, { name: "medicineName", label: "Medicine Name", required: true },
      { name: "medicineType", label: "Medicine Type" }, { name: "price", label: "Price", type: "number", required: true },
      { name: "stockQuantity", label: "Stock Quantity", type: "number" }, { name: "expiryDate", label: "Expiry Date", type: "date" },
    ]} />

    <FormCard title="Update Medicine" button="Update Medicine" onSubmit={patchById("/doctor/medicines", "medicineId")} fields={[
      { name: "medicineId", label: "Medicine ID", required: true }, { name: "medicineName", label: "Medicine Name" }, { name: "medicineType", label: "Medicine Type" },
      { name: "price", label: "Price", type: "number" }, { name: "stockQuantity", label: "Stock Quantity", type: "number" }, { name: "expiryDate", label: "Expiry Date", type: "date" },
    ]} />

    <FormCard title="Create Prescription" button="Create Prescription" onSubmit={post("/doctor/prescriptions")} fields={[
      { name: "recordId", label: "Medical Record ID", required: true }, { name: "medicineId", label: "Medicine ID", required: true }, { name: "dosage", label: "Dosage", required: true },
      { name: "frequency", label: "Frequency" }, { name: "durationDays", label: "Duration Days", type: "number" }, { name: "instructions", label: "Instructions" },
    ]} />
  </div>;
}
'@
$sqlReference = @'
-- Pet Adoption role upgrade (reference/audit copy)
-- Applied automatically by backend/applyRoleUpgrade.js.

-- Final ER compatibility expected by the new routes:
-- VOLUNTEER.SKILLS
-- EMPLOYEE/SUPERVISOR/DOCTOR.SALARY
-- VACCINATION.VACCINE_PRICE
-- MEDICINE.PRICE
-- MEDICAL_RECORD.HEALTH_STATUS
-- EXPENSE.SOURCE_NAME

CREATE OR REPLACE VIEW V_SUPERVISOR_PERSON_INFO AS
SELECT p.PERSON_ID,
       p.FIRST_NAME,
       p.LAST_NAME,
       TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS FULL_NAME,
       (SELECT LISTAGG(pp.PHONE_NO, ', ') WITHIN GROUP (ORDER BY pp.PHONE_NO)
          FROM PERSON_PHONE pp
         WHERE pp.PERSON_ID = p.PERSON_ID) AS PHONE_NO,
       p.EMAIL,
       p.ADDRESS,
       p.DATE_OF_BIRTH,
       p.GENDER,
       CASE WHEN p.DATE_OF_BIRTH IS NULL THEN NULL
            ELSE TRUNC(MONTHS_BETWEEN(SYSDATE, p.DATE_OF_BIRTH) / 12) END AS AGE
FROM PERSON p;

CREATE OR REPLACE VIEW V_SUPERVISOR_STAFF_INFO AS
SELECT p.PERSON_ID,
       TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS FULL_NAME,
       (SELECT LISTAGG(pp.PHONE_NO, ', ') WITHIN GROUP (ORDER BY pp.PHONE_NO)
          FROM PERSON_PHONE pp
         WHERE pp.PERSON_ID = p.PERSON_ID) AS PHONE_NO,
       p.EMAIL,
       CASE WHEN s.SUPERVISOR_ID IS NOT NULL THEN 'SUPERVISOR'
            WHEN d.DOCTOR_ID IS NOT NULL THEN 'DOCTOR'
            WHEN e.EMPLOYEE_ID IS NOT NULL THEN 'EMPLOYEE'
            WHEN v.VOLUNTEER_ID IS NOT NULL THEN 'VOLUNTEER' END AS STAFF_ROLE,
       e.HIRE_DATE,
       e.JOB_TITLE,
       e.EMPLOYMENT_STATUS,
       s.ASSIGNED_DATE,
       d.LICENSE_NO,
       d.SPECIALIZATION,
       v.JOIN_DATE,
       v.AVAILABILITY,
       v.SKILLS,
       CASE WHEN s.SUPERVISOR_ID IS NOT NULL THEN s.SALARY
            WHEN d.DOCTOR_ID IS NOT NULL THEN d.SALARY
            ELSE e.SALARY END AS CURRENT_SALARY
FROM PERSON p
LEFT JOIN EMPLOYEE e ON e.EMPLOYEE_ID = p.PERSON_ID
LEFT JOIN SUPERVISOR s ON s.SUPERVISOR_ID = p.PERSON_ID
LEFT JOIN DOCTOR d ON d.DOCTOR_ID = p.PERSON_ID
LEFT JOIN VOLUNTEER v ON v.VOLUNTEER_ID = p.PERSON_ID
WHERE e.EMPLOYEE_ID IS NOT NULL
   OR s.SUPERVISOR_ID IS NOT NULL
   OR d.DOCTOR_ID IS NOT NULL
   OR v.VOLUNTEER_ID IS NOT NULL;

CREATE OR REPLACE VIEW V_SUPERVISOR_SALARY_HISTORY AS
SELECT sa.SALARY_ID,
       CASE WHEN sa.EMPLOYEE_ID IS NOT NULL THEN 'EMPLOYEE'
            WHEN sa.SUPERVISOR_ID IS NOT NULL THEN 'SUPERVISOR'
            WHEN sa.DOCTOR_ID IS NOT NULL THEN 'DOCTOR' END AS RECEIVER_TYPE,
       NVL(sa.EMPLOYEE_ID, NVL(sa.SUPERVISOR_ID, sa.DOCTOR_ID)) AS RECEIVER_ID,
       TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS RECEIVER_NAME,
       sa.SALARY_DATE,
       sa.SALARY_AMOUNT,
       sa.SALARY_STATUS,
       sa.EXPENSE_ID,
       ex.SOURCE_NAME,
       ex.EXPENSE_DESCRIPTION,
       ex.EXPENSE_STATUS
FROM SALARY sa
JOIN PERSON p
  ON p.PERSON_ID = NVL(sa.EMPLOYEE_ID, NVL(sa.SUPERVISOR_ID, sa.DOCTOR_ID))
JOIN EXPENSE ex
  ON ex.EXPENSE_ID = sa.EXPENSE_ID;
'@

$utf8 = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText((Join-Path $ProjectRoot "backend\routes\roleEnhancementRoutes.js"), $routeCode, $utf8)
[System.IO.File]::WriteAllText((Join-Path $ProjectRoot "backend\applyRoleUpgrade.js"), $applyCode, $utf8)
[System.IO.File]::WriteAllText((Join-Path $ProjectRoot "frontend\src\pages\supervisor\SupervisorOperationsPage.jsx"), $supervisorPage, $utf8)
[System.IO.File]::WriteAllText((Join-Path $ProjectRoot "frontend\src\pages\doctor\DoctorOperationsPage.jsx"), $doctorPage, $utf8)
[System.IO.File]::WriteAllText((Join-Path $ProjectRoot "database\06_supervisor_doctor_upgrade.sql"), $sqlReference, $utf8)

# Patch backend/server.js
$serverPath = Join-Path $ProjectRoot "backend\server.js"
$server = [System.IO.File]::ReadAllText($serverPath)
$importLine = 'const roleEnhancementRoutes = require("./routes/roleEnhancementRoutes");'
if ($server -notmatch [regex]::Escape($importLine)) {
  $marker = "const app = express();"
  if ($server.Contains($marker)) {
    $server = $server.Replace($marker, $importLine + [Environment]::NewLine + [Environment]::NewLine + $marker)
  } else {
    throw "Could not find 'const app = express();' in backend/server.js"
  }
}
$mountLine = 'app.use("/api", roleEnhancementRoutes);'
if ($server -notmatch [regex]::Escape($mountLine)) {
  $idx = $server.IndexOf('app.use((req, res) => {')
  if ($idx -lt 0) { $idx = $server.IndexOf('app.listen(') }
  if ($idx -lt 0) { throw "Could not locate 404 handler/app.listen in backend/server.js" }
  $server = $server.Insert($idx, $mountLine + [Environment]::NewLine + [Environment]::NewLine)
}
[System.IO.File]::WriteAllText($serverPath, $server, $utf8)

# Patch frontend/src/App.jsx
$appPath = Join-Path $ProjectRoot "frontend\src\App.jsx"
$app = [System.IO.File]::ReadAllText($appPath)
$imports = @(
  'import SupervisorOperationsPage from "./pages/supervisor/SupervisorOperationsPage";',
  'import DoctorOperationsPage from "./pages/doctor/DoctorOperationsPage";'
)
foreach ($line in $imports) {
  if ($app -notmatch [regex]::Escape($line)) {
    $fn = $app.IndexOf("function App()")
    if ($fn -lt 0) { throw "Could not find function App() in frontend/src/App.jsx" }
    $app = $app.Insert($fn, $line + [Environment]::NewLine)
  }
}
$superRoute = '<Route path="/supervisor/operations" element={<SupervisorOperationsPage />} />'
if ($app -notmatch [regex]::Escape($superRoute)) {
  $marker = '<Route path="/supervisor" element={<SupervisorDashboard />} />'
  if (-not $app.Contains($marker)) { throw "Supervisor dashboard route marker not found in App.jsx" }
  $app = $app.Replace($marker, $marker + [Environment]::NewLine + "          " + $superRoute)
}
$doctorRoute = '<Route path="/doctor/operations" element={<DoctorOperationsPage />} />'
if ($app -notmatch [regex]::Escape($doctorRoute)) {
  $marker = '<Route path="/doctor" element={<DoctorDashboard />} />'
  if (-not $app.Contains($marker)) { throw "Doctor dashboard route marker not found in App.jsx" }
  $app = $app.Replace($marker, $marker + [Environment]::NewLine + "          " + $doctorRoute)
}
[System.IO.File]::WriteAllText($appPath, $app, $utf8)

# Patch sidebar menu
$layoutPath = Join-Path $ProjectRoot "frontend\src\layouts\DashboardLayout.jsx"
$layout = [System.IO.File]::ReadAllText($layoutPath)
$superMenu = '{ label: "Operations & Views", path: "/supervisor/operations", icon: "bi-tools" },'
if ($layout -notmatch [regex]::Escape($superMenu)) {
  $pattern = '(\{\s*label:\s*"Dashboard"\s*,\s*path:\s*"/supervisor"[^\r\n]*\r?\n)'
  if ($layout -notmatch $pattern) { throw "Supervisor Dashboard menu item not found in DashboardLayout.jsx" }
  $layout = [regex]::Replace($layout, $pattern, '$1' + $superMenu + [Environment]::NewLine, 1)
}
$doctorMenu = '{ label: "Pet & Medical Updates", path: "/doctor/operations", icon: "bi-pencil-square" },'
if ($layout -notmatch [regex]::Escape($doctorMenu)) {
  $pattern = '(\{\s*label:\s*"Dashboard"\s*,\s*path:\s*"/doctor"[^\r\n]*\r?\n)'
  if ($layout -notmatch $pattern) { throw "Doctor Dashboard menu item not found in DashboardLayout.jsx" }
  $layout = [regex]::Replace($layout, $pattern, '$1' + $doctorMenu + [Environment]::NewLine, 1)
}
[System.IO.File]::WriteAllText($layoutPath, $layout, $utf8)

Write-Host "Checking backend JavaScript..." -ForegroundColor Cyan
Push-Location (Join-Path $ProjectRoot "backend")
try {
  & node --check "routes\roleEnhancementRoutes.js"
  if ($LASTEXITCODE -ne 0) { throw "roleEnhancementRoutes.js syntax check failed" }
  & node --check "applyRoleUpgrade.js"
  if ($LASTEXITCODE -ne 0) { throw "applyRoleUpgrade.js syntax check failed" }
  & node -e "require('bcryptjs'); require('oracledb'); require('dotenv'); console.log('Backend dependencies OK')"
  if ($LASTEXITCODE -ne 0) { throw "Required backend package is missing. Run npm.cmd ci in backend." }

  Write-Host "Applying database compatibility columns + SQL VIEWs..." -ForegroundColor Cyan
  & node "applyRoleUpgrade.js"
  if ($LASTEXITCODE -ne 0) { throw "Database upgrade failed. Existing files are backed up in $backup" }
} finally {
  Pop-Location
}

Write-Host "Building frontend..." -ForegroundColor Cyan
Push-Location (Join-Path $ProjectRoot "frontend")
try {
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw "Frontend build failed. Existing files are backed up in $backup" }
} finally {
  Pop-Location
}

Write-Host "" 
Write-Host "ROLE UPGRADE COMPLETE" -ForegroundColor Green
Write-Host "Supervisor: Add Doctor, Add Volunteer, SQL Views, status updates, salary payment, medicine expense." -ForegroundColor Green
Write-Host "Doctor: Pet update, medical record add/update, vaccination add/status, medicine add/update, prescription add." -ForegroundColor Green
Write-Host "No new database table was created; the final table count stays unchanged." -ForegroundColor Green
Write-Host "Database reference script: database\06_supervisor_doctor_upgrade.sql" -ForegroundColor DarkGray
Write-Host "Backup: $backup" -ForegroundColor DarkGray
Write-Host "" 
Write-Host "Next: start backend and frontend normally, then open /supervisor/operations or /doctor/operations." -ForegroundColor Cyan
Write-Host "Review changes before git add/commit/push." -ForegroundColor Yellow

Push-Location $ProjectRoot
try { & git status --short } catch {}
Pop-Location
