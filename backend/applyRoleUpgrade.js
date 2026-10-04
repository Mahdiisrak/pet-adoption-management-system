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