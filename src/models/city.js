// src/models/city.js
const sql = require("mssql");
const db = require("../config/db");

class City {
  constructor(city) {
    this.cityCode = city.cityCode;
    this.cityName = city.cityName;
  }

  // الحصول على جميع المدن
  static async getAll() {
    try {
      // استخدام الطريقة المتوافقة مع Vercel
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().query(`
        SELECT 
          CityCode, CityName
        FROM City 
        ORDER BY CityName
      `);

      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error fetching cities:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على مدينة واحدة بواسطة الكود
  static async findByCode(cityCode) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().input("cityCode", sql.Int, cityCode)
        .query(`
          SELECT 
            CityCode, CityName
          FROM City 
          WHERE CityCode = @cityCode
        `);

      if (result.recordset.length === 0) {
        return { success: false, error: "City not found" };
      }

      return { success: true, data: result.recordset[0] };
    } catch (err) {
      console.error("Error finding city:", err);
      return { success: false, error: err.message };
    }
  }

  // إنشاء مدينة جديدة
  static async create(newCity, userName) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // تحقق إذا كانت هناك حقول إضافية في جدول المدن لتخزين معلومات المستخدم والتاريخ
      let hasUserFields = false;

      try {
        // التحقق من وجود الأعمدة في قاعدة البيانات
        const checkFields = await pool.request().query(`
          SELECT 
            COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'City' 
            AND COLUMN_NAME IN ('User_Add', 'Date_Add')
        `);

        hasUserFields = checkFields.recordset[0].count === 2;
      } catch (checkError) {
        console.error("Error checking columns:", checkError);
        hasUserFields = false;
      }

      let result;

      if (hasUserFields) {
        // إذا كانت الحقول موجودة، نضيفها في الاستعلام
        result = await pool
          .request()
          .input("cityName", sql.NVarChar(100), newCity.cityName)
          .input("userName", sql.NVarChar(50), userName).query(`
            INSERT INTO City (
              CityName, User_Add, Date_Add
            )
            OUTPUT INSERTED.CityCode
            VALUES (
              @cityName, @userName, GETDATE()
            )
          `);
      } else {
        // إذا لم تكن الحقول موجودة، نستخدم الاستعلام العادي
        result = await pool
          .request()
          .input("cityName", sql.NVarChar(100), newCity.cityName).query(`
            INSERT INTO City (
              CityName
            )
            OUTPUT INSERTED.CityCode
            VALUES (
              @cityName
            )
          `);
      }

      const cityCode = result.recordset[0].CityCode;
      return { success: true, data: { ...newCity, cityCode } };
    } catch (err) {
      console.error("Error creating city:", err);
      return { success: false, error: err.message };
    }
  }

  // تحديث مدينة
  static async update(cityCode, city, userName) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // تحقق إذا كانت هناك حقول إضافية في جدول المدن لتخزين معلومات المستخدم والتاريخ
      let hasUserFields = false;

      try {
        // التحقق من وجود الأعمدة في قاعدة البيانات
        const checkFields = await pool.request().query(`
          SELECT 
            COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'City' 
            AND COLUMN_NAME IN ('User_Edit', 'Date_Edit')
        `);

        hasUserFields = checkFields.recordset[0].count === 2;
      } catch (checkError) {
        console.error("Error checking columns:", checkError);
        hasUserFields = false;
      }

      if (hasUserFields) {
        // إذا كانت الحقول موجودة، نضيفها في الاستعلام
        await pool
          .request()
          .input("cityCode", sql.Int, cityCode)
          .input("cityName", sql.NVarChar(100), city.cityName)
          .input("userName", sql.NVarChar(50), userName).query(`
            UPDATE City
            SET 
              CityName = @cityName,
              User_Edit = @userName,
              Date_Edit = GETDATE()
            WHERE CityCode = @cityCode
          `);
      } else {
        // إذا لم تكن الحقول موجودة، نستخدم الاستعلام العادي
        await pool
          .request()
          .input("cityCode", sql.Int, cityCode)
          .input("cityName", sql.NVarChar(100), city.cityName).query(`
            UPDATE City
            SET 
              CityName = @cityName
            WHERE CityCode = @cityCode
          `);
      }

      return { success: true, data: { ...city, cityCode } };
    } catch (err) {
      console.error("Error updating city:", err);
      return { success: false, error: err.message };
    }
  }

  // حذف مدينة
  static async delete(cityCode) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // التحقق من وجود فنادق مرتبطة بالمدينة قبل الحذف
      const checkResult = await pool
        .request()
        .input("cityCode", sql.Int, cityCode).query(`
          SELECT COUNT(*) AS hotelCount FROM Hotel WHERE City = @cityCode
        `);

      const hotelCount = checkResult.recordset[0].hotelCount || 0;
      if (hotelCount > 0) {
        return {
          success: false,
          error: `Cannot delete city: it is referenced by ${hotelCount} hotels`,
        };
      }

      // التحقق من وجود طرق مرتبطة بالمدينة قبل الحذف
      const roadCheckResult = await pool
        .request()
        .input("cityCode", sql.Int, cityCode).query(`
          SELECT COUNT(*) AS roadCount FROM Road WHERE CityCode = @cityCode
        `);

      const roadCount = roadCheckResult.recordset[0].roadCount || 0;
      if (roadCount > 0) {
        return {
          success: false,
          error: `Cannot delete city: it is referenced by ${roadCount} roads`,
        };
      }

      await pool.request().input("cityCode", sql.Int, cityCode).query(`
          DELETE FROM City WHERE CityCode = @cityCode
        `);

      return { success: true };
    } catch (err) {
      console.error("Error deleting city:", err);
      return { success: false, error: err.message };
    }
  }

  // البحث عن مدن
  static async search(searchTerm) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool
        .request()
        .input("searchTerm", sql.NVarChar(100), `%${searchTerm}%`).query(`
          SELECT 
            CityCode, CityName
          FROM City 
          WHERE 
            CityName LIKE @searchTerm
          ORDER BY CityName
        `);

      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error searching cities:", err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = City;
