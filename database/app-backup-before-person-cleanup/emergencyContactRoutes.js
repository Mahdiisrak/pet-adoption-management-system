const express = require("express");
const oracledb = require("oracledb");

const { getConnection } = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

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

      const result = await connection.execute(
        `
        SELECT
          ec.CONTACT_NO,
          ec.PERSON_ID,
          p.NAME AS PERSON_NAME,
          ec.CONTACT_NAME,
          ec.RELATIONSHIP,
          ec.PHONE_NO
        FROM EMERGENCY_CONTACT ec
        JOIN PERSON p
          ON ec.PERSON_ID = p.PERSON_ID
        ORDER BY ec.CONTACT_NO
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
      console.error("Emergency contacts query error:", error);

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
          console.error("Connection close error:", closeError);
        }
      }
    }
  }
);

module.exports = router;
