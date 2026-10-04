const express = require("express");
const oracledb = require("oracledb");
const bcrypt = require("bcryptjs");

const { getConnection } = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

/* ============================================================
   ADMIN: VIEW ALL STAFF
============================================================ */
router.get("/admin/staff", authenticateToken, async (req, res) => {
  let connection;

  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        p.PERSON_ID,

        TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS NAME,

        (
          SELECT LISTAGG(pp.PHONE_NO, ', ')
          WITHIN GROUP (ORDER BY pp.PHONE_NO)
          FROM PERSON_PHONE pp
          WHERE pp.PERSON_ID = p.PERSON_ID
        ) AS PHONE_NO,

        p.EMAIL,

        CASE
          WHEN s.SUPERVISOR_ID IS NOT NULL THEN 'SUPERVISOR'
          WHEN d.DOCTOR_ID IS NOT NULL THEN 'DOCTOR'
          WHEN e.EMPLOYEE_ID IS NOT NULL THEN 'EMPLOYEE'
          WHEN v.VOLUNTEER_ID IS NOT NULL THEN 'VOLUNTEER'
        END AS STAFF_ROLE,

        e.HIRE_DATE,
        e.JOB_TITLE,
        e.EMPLOYMENT_STATUS,

        s.ASSIGNED_DATE,

        d.LICENSE_NO,
        d.SPECIALIZATION,

        v.JOIN_DATE,
        v.AVAILABILITY

      FROM PERSON p

      LEFT JOIN EMPLOYEE e
        ON p.PERSON_ID = e.EMPLOYEE_ID

      LEFT JOIN SUPERVISOR s
        ON p.PERSON_ID = s.SUPERVISOR_ID

      LEFT JOIN DOCTOR d
        ON p.PERSON_ID = d.DOCTOR_ID

      LEFT JOIN VOLUNTEER v
        ON p.PERSON_ID = v.VOLUNTEER_ID

      WHERE
        e.EMPLOYEE_ID IS NOT NULL
        OR s.SUPERVISOR_ID IS NOT NULL
        OR d.DOCTOR_ID IS NOT NULL
        OR v.VOLUNTEER_ID IS NOT NULL

      ORDER BY p.PERSON_ID
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    return res.status(200).json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Staff query error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve staff information",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Connection close error:", closeError);
      }
    }
  }
});

/* ============================================================
   SUPERVISOR: ADD EMPLOYEE + LOGIN ACCOUNT
============================================================ */
router.post(
  "/supervisor/employees",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (req.user.role !== "SUPERVISOR") {
        return res.status(403).json({
          success: false,
          message: "Supervisor access required",
        });
      }

      const {
        personId,
        userId,
        firstName,
        lastName,
        phoneNo,
        email,
        address,
        gender,
        dateOfBirth,
        hireDate,
        jobTitle,
        employmentStatus,
        username,
        password,
      } = req.body;

      /* ================= VALIDATION ================= */

      if (
        !personId ||
        !userId ||
        !firstName ||
        !lastName ||
        !hireDate ||
        !jobTitle ||
        !username ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Person ID, User ID, first name, last name, hire date, job title, username and password are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must contain at least 6 characters",
        });
      }

      connection = await getConnection();

      const normalizedPersonId = personId.trim().toUpperCase();
      const normalizedUserId = userId.trim().toUpperCase();
      const normalizedUsername = username.trim();

      /* ================= DUPLICATE CHECK ================= */

      const duplicateResult = await connection.execute(
        `
        SELECT
          (
            SELECT COUNT(*)
            FROM PERSON
            WHERE PERSON_ID = :personId
          ) AS PERSON_COUNT,

          (
            SELECT COUNT(*)
            FROM SYSTEM_USER
            WHERE USER_ID = :userId
               OR UPPER(USERNAME) = UPPER(:username)
          ) AS USER_COUNT

        FROM DUAL
        `,
        {
          personId: normalizedPersonId,
          userId: normalizedUserId,
          username: normalizedUsername,
        },
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        }
      );

      const duplicate = duplicateResult.rows[0];

      if (duplicate.PERSON_COUNT > 0) {
        return res.status(409).json({
          success: false,
          message: "Person ID already exists",
        });
      }

      if (duplicate.USER_COUNT > 0) {
        return res.status(409).json({
          success: false,
          message: "User ID or username already exists",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      /* ================= INSERT PERSON ================= */

      await connection.execute(
        `
        INSERT INTO PERSON
        (
          PERSON_ID,
          FIRST_NAME,
          LAST_NAME,
          EMAIL,
          ADDRESS,
          DATE_OF_BIRTH,
          GENDER
        )
        VALUES
        (
          :personId,
          :firstName,
          :lastName,
          :email,
          :address,
          TO_DATE(:dateOfBirth, 'YYYY-MM-DD'),
          :gender
        )
        `,
        {
          personId: normalizedPersonId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email || null,
          address: address || null,
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
        }
      );

      /* ================= INSERT PHONE ================= */

      if (phoneNo && phoneNo.trim()) {
        await connection.execute(
          `
          INSERT INTO PERSON_PHONE
          (
            PERSON_ID,
            PHONE_NO
          )
          VALUES
          (
            :personId,
            :phoneNo
          )
          `,
          {
            personId: normalizedPersonId,
            phoneNo: phoneNo.trim(),
          }
        );
      }

      /* ================= INSERT EMPLOYEE ================= */

      await connection.execute(
        `
        INSERT INTO EMPLOYEE
        (
          EMPLOYEE_ID,
          HIRE_DATE,
          JOB_TITLE,
          EMPLOYMENT_STATUS
        )
        VALUES
        (
          :employeeId,
          TO_DATE(:hireDate, 'YYYY-MM-DD'),
          :jobTitle,
          :employmentStatus
        )
        `,
        {
          employeeId: normalizedPersonId,
          hireDate,
          jobTitle: jobTitle.trim(),
          employmentStatus: employmentStatus || "ACTIVE",
        }
      );

      /* ================= INSERT LOGIN ================= */

      await connection.execute(
        `
        INSERT INTO SYSTEM_USER
        (
          USER_ID,
          PERSON_ID,
          USERNAME,
          PASSWORD_HASH,
          USER_ROLE,
          USER_STATUS
        )
        VALUES
        (
          :userId,
          :personId,
          :username,
          :passwordHash,
          'EMPLOYEE',
          'ACTIVE'
        )
        `,
        {
          userId: normalizedUserId,
          personId: normalizedPersonId,
          username: normalizedUsername,
          passwordHash,
        }
      );

      await connection.commit();

      return res.status(201).json({
        success: true,
        message: "Employee and login account created successfully",
        data: {
          personId: normalizedPersonId,
          userId: normalizedUserId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: normalizedUsername,
          role: "EMPLOYEE",
        },
      });
    } catch (error) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error("Rollback error:", rollbackError);
        }
      }

      console.error("Add employee error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create employee",
        error: error.message,
      });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error("Connection close error:", closeError);
        }
      }
    }
  }
);

module.exports = router;