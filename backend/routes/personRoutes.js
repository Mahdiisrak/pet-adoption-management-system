const express = require("express");
const oracledb = require("oracledb");

const { getConnection } = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/admin/persons", authenticateToken, async (req, res) => {
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
        p.FIRST_NAME,
        p.LAST_NAME,
        TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS NAME,
        (
          SELECT LISTAGG(pp.PHONE_NO, ', ')
          WITHIN GROUP (ORDER BY pp.PHONE_NO)
          FROM PERSON_PHONE pp
          WHERE pp.PERSON_ID = p.PERSON_ID
        ) AS PHONE_NO,
        p.EMAIL,
        p.ADDRESS,
        p.DATE_OF_BIRTH,
        p.GENDER
      FROM PERSON p
      ORDER BY p.PERSON_ID
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Persons query error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve persons",
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
