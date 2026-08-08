const express = require("express");
const oracledb = require("oracledb");

const { getConnection } = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();


// ======================================================
// LOCAL PETS
// ======================================================

router.get(
  "/supervisor/local-pets",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (
        req.user.role !== "SUPERVISOR" &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message: "Supervisor or Admin access required",
        });
      }

      connection = await getConnection();

      const result = await connection.execute(
        `
        SELECT
          lp.LOCAL_PET_ID,
          p.PET_NAME,
          p.SPECIES,
          p.BREED,
          lp.INTAKE_DATE,
          lp.ADOPTION_STATUS
        FROM LOCAL_PET lp
        JOIN PET p
          ON lp.LOCAL_PET_ID = p.PET_ID
        ORDER BY lp.INTAKE_DATE DESC
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
      console.error("Local pets error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve local pets",
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


// ======================================================
// GUEST PETS
// ======================================================

router.get(
  "/supervisor/guest-pets",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (
        req.user.role !== "SUPERVISOR" &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message: "Supervisor or Admin access required",
        });
      }

      connection = await getConnection();

      const result = await connection.execute(
        `
        SELECT
          gp.GUEST_PET_ID,
          p.PET_NAME,
          p.SPECIES,
          p.BREED,
          gp.OWNER_ID,
          per.NAME AS OWNER_NAME,
          gp.CHECK_IN_DATE,
          gp.CHECK_OUT_DATE,
          gp.GUEST_STATUS
        FROM GUEST_PET gp
        JOIN PET p
          ON gp.GUEST_PET_ID = p.PET_ID
        LEFT JOIN PERSON per
          ON gp.OWNER_ID = per.PERSON_ID
        ORDER BY gp.CHECK_IN_DATE DESC
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
      console.error("Guest pets error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve guest pets",
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


// ======================================================
// RESCUES
// ======================================================

router.get(
  "/supervisor/rescues",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (
        req.user.role !== "SUPERVISOR" &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message: "Supervisor or Admin access required",
        });
      }

      connection = await getConnection();

      const result = await connection.execute(
        `
        SELECT
          r.RESCUE_ID,
          r.RESCUE_LOCATION,
          r.RESCUE_DATE,
          r.RESCUE_DESCRIPTION,
          r.RESCUE_STATUS,
          rp.PET_ID,
          p.PET_NAME
        FROM RESCUE r
        LEFT JOIN RESCUE_PET rp
          ON r.RESCUE_ID = rp.RESCUE_ID
        LEFT JOIN PET p
          ON rp.PET_ID = p.PET_ID
        ORDER BY r.RESCUE_DATE DESC
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
      console.error("Rescues error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve rescues",
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


// ======================================================
// VOLUNTEERS
// ======================================================

router.get(
  "/supervisor/volunteers",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (
        req.user.role !== "SUPERVISOR" &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message: "Supervisor or Admin access required",
        });
      }

      connection = await getConnection();

      const result = await connection.execute(
        `
        SELECT
          v.VOLUNTEER_ID,
          p.NAME,
          p.PHONE_NO,
          p.EMAIL,
          v.JOIN_DATE,
          v.AVAILABILITY,
          rv.RESCUE_ID,
          rv.PARTICIPATION_ROLE,
          rv.PARTICIPATION_DATE
        FROM VOLUNTEER v
        JOIN PERSON p
          ON v.VOLUNTEER_ID = p.PERSON_ID
        LEFT JOIN RESCUE_VOLUNTEER rv
          ON v.VOLUNTEER_ID = rv.VOLUNTEER_ID
        ORDER BY v.JOIN_DATE DESC
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
      console.error("Volunteers error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve volunteers",
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