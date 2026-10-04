const express = require("express");
const oracledb = require("oracledb");

const { getConnection } = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/employee/adopters", authenticateToken, async (req, res) => {
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
        a.ADOPTER_ID,
        TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS NAME,
        (SELECT LISTAGG(pp.PHONE_NO, ', ') WITHIN GROUP (ORDER BY pp.PHONE_NO) FROM PERSON_PHONE pp WHERE pp.PERSON_ID = p.PERSON_ID) AS PHONE_NO,
        p.EMAIL,
        p.ADDRESS,
        a.OCCUPATION
      FROM ADOPTER a
      JOIN PERSON p
        ON a.ADOPTER_ID = p.PERSON_ID
      ORDER BY a.ADOPTER_ID
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
    console.error("Adopters query error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve adopters",
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

module.exports = router;
