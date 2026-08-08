const express = require("express");
const oracledb = require("oracledb");

const { getConnection } = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

/* ============================================================
   EMPLOYEE / ADMIN: VIEW EMERGENCY CONTACTS
============================================================ */
router.get(
  "/employee/emergency-contacts",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (
        req.user.role !== "EMPLOYEE" &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message: "Employee or Admin access required",
        });
      }

      connection = await getConnection();

      let sql;
      let binds = {};

      if (req.user.role === "ADMIN") {
        sql = `
          SELECT
            ec.PERSON_ID,
            ec.CONTACT_NO,
            TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS PERSON_NAME,
            ec.CONTACT_NAME,
            ec.RELATIONSHIP,
            ec.PHONE_NO
          FROM EMERGENCY_CONTACT ec
          JOIN PERSON p
            ON ec.PERSON_ID = p.PERSON_ID
          ORDER BY ec.PERSON_ID, ec.CONTACT_NO
        `;
      } else {
        const loggedInPersonId =
          req.user.personId ||
          req.user.PERSON_ID ||
          req.user.person_id;

        if (!loggedInPersonId) {
          return res.status(401).json({
            success: false,
            message: "Logged-in person ID not found",
          });
        }

        sql = `
          SELECT
            ec.PERSON_ID,
            ec.CONTACT_NO,
            TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS PERSON_NAME,
            ec.CONTACT_NAME,
            ec.RELATIONSHIP,
            ec.PHONE_NO
          FROM EMERGENCY_CONTACT ec
          JOIN PERSON p
            ON ec.PERSON_ID = p.PERSON_ID
          WHERE ec.PERSON_ID = :personId
          ORDER BY ec.CONTACT_NO
        `;

        binds = {
          personId: loggedInPersonId,
        };
      }

      const result = await connection.execute(
        sql,
        binds,
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
      console.error(
        "Emergency contacts query error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve emergency contacts",
        error: error.message,
      });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error(
            "Connection close error:",
            closeError
          );
        }
      }
    }
  }
);

/* ============================================================
   EMPLOYEE: ADD OWN EMERGENCY CONTACT
============================================================ */
router.post(
  "/employee/emergency-contacts",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (req.user.role !== "EMPLOYEE") {
        return res.status(403).json({
          success: false,
          message: "Employee access required",
        });
      }

      const loggedInPersonId =
        req.user.personId ||
        req.user.PERSON_ID ||
        req.user.person_id;

      if (!loggedInPersonId) {
        return res.status(401).json({
          success: false,
          message: "Logged-in person ID not found",
        });
      }

      const {
        contactName,
        relationship,
        phoneNo,
      } = req.body;

      if (
        !contactName ||
        !contactName.trim() ||
        !phoneNo ||
        !phoneNo.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Contact name and phone number are required",
        });
      }

      connection = await getConnection();

      /* Contact No is the partial key of the weak entity.
         Generate the next Contact No only for this person. */
      const contactNoResult = await connection.execute(
        `
        SELECT
          NVL(MAX(CONTACT_NO), 0) + 1 AS NEXT_CONTACT_NO
        FROM EMERGENCY_CONTACT
        WHERE PERSON_ID = :personId
        `,
        {
          personId: loggedInPersonId,
        },
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        }
      );

      const nextContactNo =
        contactNoResult.rows[0].NEXT_CONTACT_NO;

      await connection.execute(
        `
        INSERT INTO EMERGENCY_CONTACT
        (
          PERSON_ID,
          CONTACT_NO,
          CONTACT_NAME,
          RELATIONSHIP,
          PHONE_NO
        )
        VALUES
        (
          :personId,
          :contactNo,
          :contactName,
          :relationship,
          :phoneNo
        )
        `,
        {
          personId: loggedInPersonId,
          contactNo: nextContactNo,
          contactName: contactName.trim(),
          relationship:
            relationship && relationship.trim()
              ? relationship.trim()
              : null,
          phoneNo: phoneNo.trim(),
        }
      );

      await connection.commit();

      return res.status(201).json({
        success: true,
        message: "Emergency contact added successfully",
        data: {
          personId: loggedInPersonId,
          contactNo: nextContactNo,
          contactName: contactName.trim(),
          relationship:
            relationship && relationship.trim()
              ? relationship.trim()
              : null,
          phoneNo: phoneNo.trim(),
        },
      });
    } catch (error) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error(
            "Rollback error:",
            rollbackError
          );
        }
      }

      console.error(
        "Add emergency contact error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to add emergency contact",
        error: error.message,
      });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error(
            "Connection close error:",
            closeError
          );
        }
      }
    }
  }
);

/* ============================================================
   EMPLOYEE: UPDATE OWN EMERGENCY CONTACT
============================================================ */
router.put(
  "/employee/emergency-contacts/:contactNo",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (req.user.role !== "EMPLOYEE") {
        return res.status(403).json({
          success: false,
          message: "Employee access required",
        });
      }

      const loggedInPersonId =
        req.user.personId ||
        req.user.PERSON_ID ||
        req.user.person_id;

      if (!loggedInPersonId) {
        return res.status(401).json({
          success: false,
          message: "Logged-in person ID not found",
        });
      }

      const contactNo =
        Number(req.params.contactNo);

      const {
        contactName,
        relationship,
        phoneNo,
      } = req.body;

      if (
        !Number.isInteger(contactNo) ||
        contactNo <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid contact number",
        });
      }

      if (
        !contactName ||
        !contactName.trim() ||
        !phoneNo ||
        !phoneNo.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Contact name and phone number are required",
        });
      }

      connection = await getConnection();

      const result = await connection.execute(
        `
        UPDATE EMERGENCY_CONTACT
        SET
          CONTACT_NAME = :contactName,
          RELATIONSHIP = :relationship,
          PHONE_NO = :phoneNo
        WHERE PERSON_ID = :personId
          AND CONTACT_NO = :contactNo
        `,
        {
          contactName: contactName.trim(),

          relationship:
            relationship && relationship.trim()
              ? relationship.trim()
              : null,

          phoneNo: phoneNo.trim(),

          personId: loggedInPersonId,
          contactNo,
        }
      );

      if (result.rowsAffected === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Emergency contact not found",
        });
      }

      await connection.commit();

      return res.status(200).json({
        success: true,
        message:
          "Emergency contact updated successfully",
        data: {
          personId: loggedInPersonId,
          contactNo,
          contactName: contactName.trim(),
          relationship:
            relationship && relationship.trim()
              ? relationship.trim()
              : null,
          phoneNo: phoneNo.trim(),
        },
      });
    } catch (error) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error(
            "Rollback error:",
            rollbackError
          );
        }
      }

      console.error(
        "Update emergency contact error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update emergency contact",
        error: error.message,
      });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error(
            "Connection close error:",
            closeError
          );
        }
      }
    }
  }
);

module.exports = router;