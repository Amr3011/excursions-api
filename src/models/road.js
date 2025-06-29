// src/models/road.js
const sql = require("mssql");
const { poolPromise } = require("../config/db");

class Road {
  constructor(road) {
    this.cityCode = road.cityCode;
    this.roadCode = road.roadCode;
    this.transType = road.transType;
    this.roadName = road.roadName;
  }

  // الحصول على جميع الطرق
  static async getAll() {
    try {
      const pool = await poolPromise;
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().query(`
        SELECT 
          r.CityCode, r.RoadCode, r.TransType, r.RoadName, 
          c.CityName
        FROM Road r
        LEFT JOIN City c ON r.CityCode = c.CityCode
        ORDER BY c.CityName, r.RoadName
      `);

      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error fetching roads:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على طريق واحد بواسطة الكود
  static async findByCode(cityCode, roadCode) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool
        .request()
        .input("cityCode", sql.Int, cityCode)
        .input("roadCode", sql.Int, roadCode).query(`
          SELECT 
            r.CityCode, r.RoadCode, r.TransType, r.RoadName, 
            c.CityName
          FROM Road r
          LEFT JOIN City c ON r.CityCode = c.CityCode
          WHERE r.CityCode = @cityCode AND r.RoadCode = @roadCode
        `);

      if (result.recordset.length === 0) {
        return { success: false, error: "Road not found" };
      }

      return { success: true, data: result.recordset[0] };
    } catch (err) {
      console.error("Error finding road:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على الطرق حسب المدينة
  static async findByCity(cityCode) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().input("cityCode", sql.Int, cityCode)
        .query(`
          SELECT 
            r.CityCode, r.RoadCode, r.TransType, r.RoadName, 
            c.CityName
          FROM Road r
          LEFT JOIN City c ON r.CityCode = c.CityCode
          WHERE r.CityCode = @cityCode
          ORDER BY r.RoadName
        `);

      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error finding roads by city:", err);
      return { success: false, error: err.message };
    }
  }

  // إنشاء طريق جديد
  static async create(newRoad, userName) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // التحقق من وجود المدينة
      const cityCheck = await pool
        .request()
        .input("cityCode", sql.Int, newRoad.cityCode)
        .query(`SELECT COUNT(*) AS count FROM City WHERE CityCode = @cityCode`);

      if (cityCheck.recordset[0].count === 0) {
        return { success: false, error: "City not found" };
      }

      // تحقق إذا كانت هناك حقول إضافية في جدول الطرق لتخزين معلومات المستخدم والتاريخ
      let hasUserFields = false;

      try {
        // التحقق من وجود الأعمدة في قاعدة البيانات
        const checkFields = await pool.request().query(`
          SELECT 
            COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'Road' 
            AND COLUMN_NAME IN ('User_Add', 'Date_Add')
        `);

        hasUserFields = checkFields.recordset[0].count === 2;
      } catch (checkError) {
        console.error("Error checking columns:", checkError);
        hasUserFields = false;
      }

      // التحقق من وجود طريق بنفس الكود في المدينة
      const roadCheck = await pool
        .request()
        .input("cityCode", sql.Int, newRoad.cityCode)
        .input("roadCode", sql.Int, newRoad.roadCode).query(`
          SELECT COUNT(*) AS count 
          FROM Road 
          WHERE CityCode = @cityCode AND RoadCode = @roadCode
        `);

      if (roadCheck.recordset[0].count > 0) {
        return {
          success: false,
          error: "Road with this code already exists in this city",
        };
      }

      let query;

      if (hasUserFields) {
        query = `
          INSERT INTO Road (
            CityCode, RoadCode, TransType, RoadName, User_Add, Date_Add
          )
          VALUES (
            @cityCode, @roadCode, @transType, @roadName, @userName, GETDATE()
          )
        `;
      } else {
        query = `
          INSERT INTO Road (
            CityCode, RoadCode, TransType, RoadName
          )
          VALUES (
            @cityCode, @roadCode, @transType, @roadName
          )
        `;
      }

      await pool
        .request()
        .input("cityCode", sql.Int, newRoad.cityCode)
        .input("roadCode", sql.Int, newRoad.roadCode)
        .input("transType", sql.NVarChar(50), newRoad.transType || null)
        .input("roadName", sql.NVarChar(100), newRoad.roadName)
        .input("userName", sql.NVarChar(50), userName)
        .query(query);

      // الحصول على اسم المدينة للإضافة إلى البيانات المرجعة
      const cityResult = await pool
        .request()
        .input("cityCode", sql.Int, newRoad.cityCode)
        .query(`SELECT CityName FROM City WHERE CityCode = @cityCode`);

      const cityName =
        cityResult.recordset.length > 0
          ? cityResult.recordset[0].CityName
          : null;

      return {
        success: true,
        data: {
          ...newRoad,
          cityName,
        },
      };
    } catch (err) {
      console.error("Error creating road:", err);
      return { success: false, error: err.message };
    }
  }

  // تحديث طريق
  static async update(cityCode, roadCode, road, userName) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // التحقق من وجود الطريق
      const roadCheck = await pool
        .request()
        .input("cityCode", sql.Int, cityCode)
        .input("roadCode", sql.Int, roadCode).query(`
          SELECT COUNT(*) AS count 
          FROM Road 
          WHERE CityCode = @cityCode AND RoadCode = @roadCode
        `);

      if (roadCheck.recordset[0].count === 0) {
        return { success: false, error: "Road not found" };
      }

      // تحقق إذا كانت هناك حقول إضافية في جدول الطرق لتخزين معلومات المستخدم والتاريخ
      let hasUserFields = false;

      try {
        // التحقق من وجود الأعمدة في قاعدة البيانات
        const checkFields = await pool.request().query(`
          SELECT 
            COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'Road' 
            AND COLUMN_NAME IN ('User_Edit', 'Date_Edit')
        `);

        hasUserFields = checkFields.recordset[0].count === 2;
      } catch (checkError) {
        console.error("Error checking columns:", checkError);
        hasUserFields = false;
      }

      let query;

      if (hasUserFields) {
        query = `
          UPDATE Road
          SET 
            TransType = @transType,
            RoadName = @roadName,
            User_Edit = @userName,
            Date_Edit = GETDATE()
          WHERE CityCode = @cityCode AND RoadCode = @roadCode
        `;
      } else {
        query = `
          UPDATE Road
          SET 
            TransType = @transType,
            RoadName = @roadName
          WHERE CityCode = @cityCode AND RoadCode = @roadCode
        `;
      }

      await pool
        .request()
        .input("cityCode", sql.Int, cityCode)
        .input("roadCode", sql.Int, roadCode)
        .input("transType", sql.NVarChar(50), road.transType || null)
        .input("roadName", sql.NVarChar(100), road.roadName)
        .input("userName", sql.NVarChar(50), userName)
        .query(query);

      // الحصول على اسم المدينة للإضافة إلى البيانات المرجعة
      const cityResult = await pool
        .request()
        .input("cityCode", sql.Int, cityCode)
        .query(`SELECT CityName FROM City WHERE CityCode = @cityCode`);

      const cityName =
        cityResult.recordset.length > 0
          ? cityResult.recordset[0].CityName
          : null;

      return {
        success: true,
        data: {
          cityCode,
          roadCode,
          transType: road.transType,
          roadName: road.roadName,
          cityName,
        },
      };
    } catch (err) {
      console.error("Error updating road:", err);
      return { success: false, error: err.message };
    }
  }

  // حذف طريق
  static async delete(cityCode, roadCode) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // التحقق من وجود رحلات مرتبطة بالطريق قبل الحذف
      const checkResult = await pool
        .request()
        .input("cityCode", sql.Int, cityCode)
        .input("roadCode", sql.Int, roadCode).query(`
          SELECT COUNT(*) AS excursionCount 
          FROM Excursions 
          WHERE City = @cityCode AND Road = @roadCode
        `);

      const excursionCount = checkResult.recordset[0].excursionCount || 0;
      if (excursionCount > 0) {
        return {
          success: false,
          error: `Cannot delete road: it is referenced by ${excursionCount} excursions`,
        };
      }

      await pool
        .request()
        .input("cityCode", sql.Int, cityCode)
        .input("roadCode", sql.Int, roadCode).query(`
          DELETE FROM Road WHERE CityCode = @cityCode AND RoadCode = @roadCode
        `);

      return { success: true };
    } catch (err) {
      console.error("Error deleting road:", err);
      return { success: false, error: err.message };
    }
  }

  // البحث عن طرق
  static async search(searchTerm) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool
        .request()
        .input("searchTerm", sql.NVarChar(100), `%${searchTerm}%`).query(`
          SELECT 
            r.CityCode, r.RoadCode, r.TransType, r.RoadName, 
            c.CityName
          FROM Road r
          LEFT JOIN City c ON r.CityCode = c.CityCode
          WHERE 
            r.RoadName LIKE @searchTerm OR
            c.CityName LIKE @searchTerm OR
            r.TransType LIKE @searchTerm
          ORDER BY c.CityName, r.RoadName
        `);

      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error searching roads:", err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = Road;
