const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'evngenco2_pmb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => {
    console.log('✅ Kết nối database thành công!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối database:', err);
  });

module.exports = pool;
