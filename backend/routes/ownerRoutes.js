const express = require("express");
const oracledb = require("oracledb");

const { getConnection } = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/employee/owners", authenticateToken, async (req, res) => {
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
        o.OWNER_ID,
        TRIM(p.FIRST_NAME || ' ' || p.LAST_NAME) AS NAME,
        (SELECT LISTAGG(pp.PHONE_NO, ', ') WITHIN GROUP (ORDER BY pp.PHONE_NO) FROM PERSON_PHONE pp WHERE pp.PERSON_ID = p.PERSON_ID) AS PHONE_NO,
        p.EMAIL,
        p.ADDRESS,
        o.OCCUPATION,

        gp.GUEST_PET_ID,
        pet.PET_NAME AS GUEST_PET_NAME,
        pet.SPECIES,
        pet.BREED,
        gp.CHECK_IN_DATE,
        gp.CHECK_OUT_DATE,
        gp.GUEST_STATUS

      FROM OWNER o

      JOIN PERSON p
        ON o.OWNER_ID = p.PERSON_ID

      LEFT JOIN GUEST_PET gp
        ON o.OWNER_ID = gp.OWNER_ID
       AND gp.GUEST_STATUS = 'CHECKED_IN'
       AND gp.CHECK_OUT_DATE IS NULL

      LEFT JOIN PET pet
        ON gp.GUEST_PET_ID = pet.PET_ID

      ORDER BY o.OWNER_ID, gp.GUEST_PET_ID
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    const ownersMap = new Map();

    for (const row of result.rows) {
      if (!ownersMap.has(row.OWNER_ID)) {
        ownersMap.set(row.OWNER_ID, {
          OWNER_ID: row.OWNER_ID,
          NAME: row.NAME,
          PHONE_NO: row.PHONE_NO,
          EMAIL: row.EMAIL,
          ADDRESS: row.ADDRESS,
          OCCUPATION: row.OCCUPATION,
          CURRENT_GUEST_PETS: [],
        });
      }

      if (row.GUEST_PET_ID) {
        ownersMap.get(row.OWNER_ID).CURRENT_GUEST_PETS.push({
          GUEST_PET_ID: row.GUEST_PET_ID,
          PET_NAME: row.GUEST_PET_NAME,
          SPECIES: row.SPECIES,
          BREED: row.BREED,
          CHECK_IN_DATE: row.CHECK_IN_DATE,
          CHECK_OUT_DATE: row.CHECK_OUT_DATE,
          GUEST_STATUS: row.GUEST_STATUS,
        });
      }
    }

    const owners = Array.from(ownersMap.values());

    return res.status(200).json({
      success: true,
      total: owners.length,
      data: owners,
    });
  } catch (error) {
    console.error("Owners query error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve owners",
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
