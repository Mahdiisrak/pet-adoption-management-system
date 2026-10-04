const express = require("express");
const oracledb = require("oracledb");

const { getConnection } = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/employee/adoptions", authenticateToken, async (req, res) => {
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
        ap.ADOPTION_ID,
        ap.ADOPTER_ID,
        p.NAME AS ADOPTER_NAME,
        ap.EMPLOYEE_ID,
        ap.PET_ID,
        pet.PET_NAME,
        ap.APPLICATION_DATE,
        ap.COMPLETION_DATE,
        ap.ADOPTION_STATUS
      FROM ADOPTION_PROCESS ap
      JOIN PERSON p
        ON ap.ADOPTER_ID = p.PERSON_ID
      JOIN PET pet
        ON ap.PET_ID = pet.PET_ID
      ORDER BY ap.ADOPTION_ID
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
    console.error("Adoptions query error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve adoption information",
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
