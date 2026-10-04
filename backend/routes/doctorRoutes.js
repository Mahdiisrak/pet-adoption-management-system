const express = require("express");
const oracledb = require("oracledb");

const { getConnection } = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();


// ======================================================
// DOCTOR DASHBOARD
// ======================================================

router.get(
  "/doctor/dashboard",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (
        req.user.role !== "DOCTOR" &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message: "Doctor or Admin access required",
        });
      }

      connection = await getConnection();

      const medicalResult = await connection.execute(
        `
        SELECT COUNT(*) AS TOTAL_RECORDS
        FROM MEDICAL_RECORD
        WHERE DOCTOR_ID = :doctorId
        `,
        {
          doctorId: req.user.personId,
        },
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        }
      );

      const vaccinationResult = await connection.execute(
        `
        SELECT COUNT(*) AS TOTAL_VACCINATIONS
        FROM VACCINATION v
        JOIN MEDICAL_RECORD mr
          ON v.RECORD_ID = mr.RECORD_ID
        WHERE mr.DOCTOR_ID = :doctorId
        `,
        {
          doctorId: req.user.personId,
        },
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        }
      );

      const medicineResult = await connection.execute(
        `
        SELECT COUNT(*) AS TOTAL_MEDICINES
        FROM MEDICINE
        `,
        [],
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        }
      );

      return res.status(200).json({
        success: true,
        data: {
          medicalRecords:
            medicalResult.rows[0].TOTAL_RECORDS,
          vaccinations:
            vaccinationResult.rows[0].TOTAL_VACCINATIONS,
          medicines:
            medicineResult.rows[0].TOTAL_MEDICINES,
        },
      });

    } catch (error) {
      console.error("Doctor dashboard error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load doctor dashboard",
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


// ======================================================
// MEDICAL RECORDS
// ======================================================

router.get(
  "/doctor/medical-records",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (
        req.user.role !== "DOCTOR" &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message: "Doctor or Admin access required",
        });
      }

      connection = await getConnection();

      const result = await connection.execute(
        `
        SELECT
          mr.RECORD_ID,
          mr.PET_ID,
          p.PET_NAME,
          mr.RECORD_DATE,
          mr.DIAGNOSIS,
          mr.TREATMENT,
          mr.HEALTH_STATUS
        FROM MEDICAL_RECORD mr
        JOIN PET p
          ON mr.PET_ID = p.PET_ID
        WHERE mr.DOCTOR_ID = :doctorId
        ORDER BY mr.RECORD_DATE DESC
        `,
        {
          doctorId: req.user.personId,
        },
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
      console.error("Medical records error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve medical records",
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


// ======================================================
// VACCINATIONS
// ======================================================

router.get(
  "/doctor/vaccinations",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (
        req.user.role !== "DOCTOR" &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message: "Doctor or Admin access required",
        });
      }

      connection = await getConnection();

      const result = await connection.execute(
        `
        SELECT
          v.VACCINATION_ID,
          mr.PET_ID,
          p.PET_NAME,
          v.VACCINE_NAME,
          v.VACCINATION_DATE,
          v.NEXT_DUE_DATE,
          v.VACCINATION_STATUS
        FROM VACCINATION v
        JOIN MEDICAL_RECORD mr
          ON v.RECORD_ID = mr.RECORD_ID
        JOIN PET p
          ON mr.PET_ID = p.PET_ID
        WHERE mr.DOCTOR_ID = :doctorId
        ORDER BY v.VACCINATION_DATE DESC
        `,
        {
          doctorId: req.user.personId,
        },
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
      console.error("Vaccinations error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve vaccinations",
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


// ======================================================
// MEDICINES
// ======================================================

router.get(
  "/doctor/medicines",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (
        req.user.role !== "DOCTOR" &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message: "Doctor or Admin access required",
        });
      }

      connection = await getConnection();

      const result = await connection.execute(
        `
        SELECT
          MEDICINE_ID,
          MEDICINE_NAME,
          MEDICINE_TYPE,
          PRICE,
          STOCK_QUANTITY,
          EXPIRY_DATE
        FROM MEDICINE
        ORDER BY MEDICINE_NAME
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
      console.error("Medicines error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve medicines",
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


// ======================================================
// PRESCRIPTIONS
// ======================================================

router.get(
  "/doctor/prescriptions",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (
        req.user.role !== "DOCTOR" &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message: "Doctor or Admin access required",
        });
      }

      connection = await getConnection();

      const result = await connection.execute(
        `
        SELECT
          pr.RECORD_ID,
          mr.PET_ID,
          p.PET_NAME,
          pr.MEDICINE_ID,
          m.MEDICINE_NAME,
          pr.DOSAGE,
          pr.FREQUENCY,
          pr.DURATION_DAYS,
          pr.INSTRUCTIONS
        FROM PRESCRIPTION pr
        JOIN MEDICAL_RECORD mr
          ON pr.RECORD_ID = mr.RECORD_ID
        JOIN PET p
          ON mr.PET_ID = p.PET_ID
        JOIN MEDICINE m
          ON pr.MEDICINE_ID = m.MEDICINE_ID
        WHERE mr.DOCTOR_ID = :doctorId
        ORDER BY pr.RECORD_ID, pr.MEDICINE_ID
        `,
        {
          doctorId: req.user.personId,
        },
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
      console.error("Prescriptions error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve prescriptions",
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