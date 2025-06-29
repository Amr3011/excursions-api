const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const errorHandler = require("./middleware/error");
const { getCurrentUser, getCurrentDateTime } = require("./utils/user");

// تحميل متغيرات البيئة
dotenv.config();

// إنشاء تطبيق Express
const app = express();

// الوسائط (Middleware)
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// تجربة الاتصال بقاعدة البيانات
try {
  const { poolPromise } = require("./config/db");
  if (poolPromise) {
    poolPromise
      .then((pool) => {
        if (pool) {
          console.log("Connected to SQL Server successfully!");
        }
      })
      .catch((err) => {
        console.error("Failed to connect to database:", err);
      });
  }
} catch (error) {
  console.error("Error importing database module:", error);
}

// استيراد المسارات
const excursionRoutes = require("./routes/excursions");

// استيراد مسارات الفنادق بشكل آمن
let hotelRoutes;
try {
  const hotelRoutesPath = path.join(__dirname, "routes", "hotels.js");
  console.log(`Trying to load hotel routes from: ${hotelRoutesPath}`);

  // التحقق من وجود الملف
  const fs = require("fs");
  if (fs.existsSync(hotelRoutesPath)) {
    hotelRoutes = require("./routes/hotels");
    console.log("Hotel routes loaded successfully");
  } else {
    console.error(`Hotel routes file does not exist at: ${hotelRoutesPath}`);
  }
} catch (error) {
  console.error("Failed to load hotel routes:", error.message);
}

// استيراد مسارات المدن بشكل آمن
let cityRoutes;
try {
  const cityRoutesPath = path.join(__dirname, "routes", "cities.js");
  console.log(`Trying to load city routes from: ${cityRoutesPath}`);

  // التحقق من وجود الملف
  const fs = require("fs");
  if (fs.existsSync(cityRoutesPath)) {
    cityRoutes = require("./routes/cities");
    console.log("City routes loaded successfully");
  } else {
    console.error(`City routes file does not exist at: ${cityRoutesPath}`);
  }
} catch (error) {
  console.error("Failed to load city routes:", error.message);
}

// استيراد مسارات الطرق بشكل آمن
let roadRoutes;
try {
  const roadRoutesPath = path.join(__dirname, "routes", "roads.js");
  console.log(`Trying to load road routes from: ${roadRoutesPath}`);

  // التحقق من وجود الملف
  const fs = require("fs");
  if (fs.existsSync(roadRoutesPath)) {
    roadRoutes = require("./routes/roads");
    console.log("Road routes loaded successfully");
  } else {
    console.error(`Road routes file does not exist at: ${roadRoutesPath}`);
  }
} catch (error) {
  console.error("Failed to load road routes:", error.message);
}
// استيراد مسارات العملات بشكل آمن
let currencyRoutes;
try {
  const currencyRoutesPath = path.join(__dirname, "routes", "currencies.js");
  console.log(`Trying to load currency routes from: ${currencyRoutesPath}`);

  // التحقق من وجود الملف
  const fs = require("fs");
  if (fs.existsSync(currencyRoutesPath)) {
    currencyRoutes = require("./routes/currencies");
    console.log("Currency routes loaded successfully");
  } else {
    console.error(
      `Currency routes file does not exist at: ${currencyRoutesPath}`
    );
  }
} catch (error) {
  console.error("Failed to load currency routes:", error.message);
}
// استيراد مسارات الجنسيات بشكل آمن
let nationalityRoutes;
try {
  const nationalityRoutesPath = path.join(
    __dirname,
    "routes",
    "nationalities.js"
  );
  console.log(
    `Trying to load nationality routes from: ${nationalityRoutesPath}`
  );

  // التحقق من وجود الملف
  const fs = require("fs");
  if (fs.existsSync(nationalityRoutesPath)) {
    nationalityRoutes = require("./routes/nationalities");
    console.log("Nationality routes loaded successfully");
  } else {
    console.error(
      `Nationality routes file does not exist at: ${nationalityRoutesPath}`
    );
  }
} catch (error) {
  console.error("Failed to load nationality routes:", error.message);
}

// عرض معلومات المستخدم الحالي والتاريخ عند بدء التشغيل
console.log(`Server started by ${getCurrentUser()} at ${getCurrentDateTime()}`);

// تسجيل المسارات
app.use("/api/excursions", excursionRoutes);

// تسجيل مسارات الفنادق إذا تم تحميلها بنجاح
if (hotelRoutes) {
  console.log("Registering hotel routes...");
  app.use("/api/hotels", hotelRoutes);
  console.log("Hotel routes registered successfully");
}

// تسجيل مسارات المدن إذا تم تحميلها بنجاح
if (cityRoutes) {
  console.log("Registering city routes...");
  app.use("/api/cities", cityRoutes);
  console.log("City routes registered successfully");
}

// تسجيل مسارات الجنسيات إذا تم تحميلها بنجاح
if (nationalityRoutes) {
  console.log("Registering nationality routes...");
  app.use("/api/nationalities", nationalityRoutes);
  console.log("Nationality routes registered successfully");
}
// تسجيل مسارات الطرق إذا تم تحميلها بنجاح
if (roadRoutes) {
  console.log("Registering road routes...");
  app.use("/api/roads", roadRoutes);
  console.log("Road routes registered successfully");
}
// تسجيل مسارات العملات إذا تم تحميلها بنجاح
if (currencyRoutes) {
  console.log("Registering currency routes...");
  app.use("/api/currencies", currencyRoutes);
  console.log("Currency routes registered successfully");
}

// مسار اختبار
app.get("/", (req, res) => {
  res.json({
    message: "مرحباً بك في واجهة برمجة تطبيق إدارة الرحلات السياحية",
    serverTime: getCurrentDateTime(),
  });
});

// وسيط معالجة الأخطاء
app.use(errorHandler);

// تعيين المنفذ وبدء تشغيل الخادم
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// معالجة الخطأ غير المتوقع
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  // عدم إنهاء الخادم عند حدوث خطأ غير متوقع
  console.error("Unhandled Rejection:", err);
});
module.exports = app;
