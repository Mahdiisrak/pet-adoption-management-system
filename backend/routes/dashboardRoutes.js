const express = require("express");
const oracledb = require("oracledb");

const { getConnection } = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/admin/dashboard", authenticateToken, async (req, res) => {
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
        (SELECT COUNT(*) FROM PET) AS TOTAL_PETS,
        (SELECT COUNT(*) FROM LOCAL_PET) AS LOCAL_PETS,
        (SELECT COUNT(*) FROM GUEST_PET) AS GUEST_PETS,
        (
          SELECT COUNT(*)
          FROM ADOPTION_PROCESS
          WHERE ADOPTION_STATUS = 'COMPLETED'
        ) AS COMPLETED_ADOPTIONS,
        (
          SELECT COUNT(*)
          FROM RESCUE
          WHERE RESCUE_STATUS = 'ACTIVE'
        ) AS ACTIVE_RESCUES,
        (SELECT COUNT(*) FROM VOLUNTEER) AS TOTAL_VOLUNTEERS,
        (
          SELECT NVL(SUM(AMOUNT), 0)
          FROM DONOR
        ) AS DONATION_AMOUNT,
        (
          SELECT
            NVL((SELECT SUM(AMOUNT) FROM INCOME), 0)
            -
            NVL((SELECT SUM(AMOUNT) FROM EXPENSE), 0)
          FROM DUAL
        ) AS CURRENT_BALANCE,
        (
          SELECT COUNT(*)
          FROM VACCINATION
          WHERE NEXT_DUE_DATE >= SYSDATE
        ) AS UPCOMING_VACCINATIONS
      FROM DUAL
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics",
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
