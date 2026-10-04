const oracledb = require("oracledb");

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

async function getConnection() {
  return oracledb.getConnection(dbConfig);
}

async function testConnection() {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT USER AS USERNAME,
              SYS_CONTEXT('USERENV', 'CON_NAME') AS CONTAINER_NAME
       FROM DUAL`
    );

    return {
      success: true,
      username: result.rows[0][0],
      container: result.rows[0][1]
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = {
  getConnection,
  testConnection
};
