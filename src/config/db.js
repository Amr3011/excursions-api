const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config();

const config = {
  user: process.env.DB_USER || "Amr",
  password: process.env.DB_PASSWORD || "Osama_fakharany@230365",
  server: process.env.DB_SERVER || "72.167.37.169",
  database: process.env.DB_NAME || "ERPTourist-BlueBay",
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: false, // SQL Server 2012 غالباً لا يتطلب تشفير
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName: "", // أضف اسم الـ Instance إذا كان موجود
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

const createConnection = async () => {
  try {
    console.log(`Connecting to database: ${config.server}:${config.port}`);
    console.log(`User: ${config.user}`);
    console.log(`Database: ${config.database}`);

    const pool = await new sql.ConnectionPool(config).connect();
    console.log("Connected to SQL Server 2012 successfully!");
    return pool;
  } catch (err) {
    console.error("Database Connection Failed:", err);
    console.error("Config used:", {
      server: config.server,
      port: config.port,
      user: config.user,
      database: config.database,
      encrypt: config.options.encrypt,
    });
    return null;
  }
};

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
