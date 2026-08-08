const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const router = express.Router();

router.post("/login", async (req, res) => {
  let connection;

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        su.USER_ID,
        su.PERSON_ID,
        su.USERNAME,
        su.PASSWORD_HASH,
        su.USER_ROLE,
        su.USER_STATUS,
        p.NAME,
        p.EMAIL
      FROM SYSTEM_USER su
      JOIN PERSON p
        ON su.PERSON_ID = p.PERSON_ID
      WHERE UPPER(su.USERNAME) = UPPER(:username)
      `,
      { username: username.trim() },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const user = result.rows[0];

    if (user.USER_STATUS !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "This account is not active",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.PASSWORD_HASH
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.USER_ID,
        personId: user.PERSON_ID,
        role: user.USER_ROLE,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        userId: user.USER_ID,
        personId: user.PERSON_ID,
        username: user.USERNAME,
        name: user.NAME,
        email: user.EMAIL,
        role: user.USER_ROLE,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
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
