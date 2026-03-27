const mysql = require('mysql2/promise');

let pool;


const createConnectionPool = () => {
  const connectionObj = {
    host: process.env.HOST_NAME || 'localhost',
    user: process.env.USER_NAME || 'admin',
    password: process.env.PASSWORD || 'admin',
    database: process.env.DATABASE || 'jokes_db',
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  pool = mysql.createPool(connectionObj);
}

const isConnected = async () => {
  try {
    const [result] = await queryDatabase('SELECT DATABASE() AS CurrentDatabase');
    return result.CurrentDatabase;
  } catch (err) {
    await pool.end();
    throw err;
  }
}

const queryDatabase = async (query, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (connection) connection.release();
  }
}

// Insert joke with type handling
const insertJoke = async (setup, punchline, typeName) => {
  try {
    let typeId;

    // Get or create type
    const typeResult = await queryDatabase(
      'SELECT id FROM types WHERE type_name = ?',
      [typeName]
    );

    if (typeResult.length > 0) {
      typeId = typeResult[0].id;
    } else {
      const insertType = await queryDatabase(
        'INSERT INTO types (type_name) VALUES (?)',
        [typeName]
      );
      typeId = insertType.insertId;
    }

    // Insert joke
    const insertJoke = await queryDatabase(
      'INSERT INTO jokes (setup, punchline, type_id) VALUES (?, ?, ?)',
      [setup, punchline, typeId]
    );

    return insertJoke.insertId;
  } catch (err) {
    throw err;
  }
}

const getJokeTypes = async () => {
  const sql = 'SELECT DISTINCT type_name FROM types ORDER BY type_name';
  return await queryDatabase(sql);
}

createConnectionPool();

module.exports = {
  isConnected,
  insertJoke,
  getJokeTypes
};