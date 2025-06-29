// src/config/db.js
const sql = require("mssql");
const dotenv = require("dotenv");

// تحميل متغيرات البيئة
dotenv.config();

// تكوين الاتصال بقاعدة البيانات
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false, // تعديل هذه القيمة لتكون false
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

// إنشاء تجمع الاتصالات
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to SQL Server successfully!");
    return pool;
  })
  .catch((err) => {
    console.error("Database Connection Failed! Bad Config:", err);
    // عدم إنهاء التطبيق في حالة فشل الاتصال الأولي
    return null;
  });

module.exports = {
  poolPromise,
  sql,
};
