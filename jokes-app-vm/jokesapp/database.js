const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'admin',
  password: process.env.MYSQL_PASSWORD || 'admin',
  database: process.env.MYSQL_DATABASE || 'jokes_db',
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function queryDatabase(sql) {
  try {
    const connection = await pool.getConnection();
    const result = await connection.query(sql);
    connection.release();
    return result;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

module.exports = { queryDatabase };
