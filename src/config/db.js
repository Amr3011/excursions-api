const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config();

// تحديد ما إذا كان التطبيق يعمل على Vercel
const isVercel = process.env.VERCEL === "1";

console.log("Environment:", isVercel ? "Vercel" : "Local");
console.log("Date and time:", "2025-06-29 15:02:26");
console.log("User:", "Amr3011");

// تكوين قاعدة البيانات
const config = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "YourPassword",
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "ExcursionsDB",
  options: {
    encrypt: isVercel, // تفعيل التشفير في بيئة Vercel فقط
    trustServerCertificate: true, // السماح بالشهادات غير الموثوقة
    enableArithAbort: true,
  },
  connectionTimeout: 30000,
};

// إنشاء اتصال بقاعدة البيانات
const createConnection = async () => {
  try {
    console.log("Connecting to database:", config.server);
    const pool = await new sql.ConnectionPool(config).connect();
    console.log("Connected to SQL Server successfully!");
    return pool;
  } catch (err) {
    console.error("Database Connection Failed:", err.message);
    return null;
  }
};

// للتوافق مع الكود القديم
let globalPool = null;
const poolPromise = (async () => {
  if (!globalPool) {
    globalPool = await createConnection();
  }
  return globalPool;
})();

module.exports = {
  sql,
  createConnection,
  poolPromise,
};
