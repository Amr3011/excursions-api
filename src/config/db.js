const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config();

// تحديد ما إذا كان التطبيق يعمل على Vercel
const isVercel = process.env.VERCEL === "1";

// تكوين قاعدة البيانات بناءً على بيئة التشغيل
const config = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "YourPassword",
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "ExcursionsDB",
  options: {
    encrypt: isVercel ? true : process.env.DB_ENCRYPT === "true",
    trustServerCertificate: !isVercel, // فقط في البيئة المحلية
    enableArithAbort: true,
  },
  connectionTimeout: 30000, // زيادة مهلة الاتصال
  requestTimeout: 30000, // زيادة مهلة الطلب
};

console.log("Environment:", isVercel ? "Vercel" : "Local");
console.log("Database config:", {
  user: config.user,
  server: config.server,
  database: config.database,
  encrypt: config.options.encrypt,
  trustServerCertificate: config.options.trustServerCertificate,
});

// وظيفة لإنشاء اتصال جديد
const createConnection = async () => {
  try {
    const pool = await new sql.ConnectionPool(config).connect();
    console.log("Connected to SQL Server successfully");
    return pool;
  } catch (err) {
    console.error("Database Connection Failed:", err);
    return null;
  }
};

// إنشاء مجمع اتصال واحد ليتم استخدامه في التطبيق
const poolPromise = createConnection();

module.exports = {
  sql,
  poolPromise,
  createConnection, // تصدير وظيفة الاتصال لإعادة استخدامها عند الحاجة
};
