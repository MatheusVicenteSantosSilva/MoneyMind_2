// backend/db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); // Use .env para suas credenciais

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Matheus@25',
    database: process.env.DB_NAME || 'moneymind',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;