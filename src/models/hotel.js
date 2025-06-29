// src/models/hotel.js
const sql = require("mssql");
const { poolPromise } = require("../config/db");

class Hotel {
  constructor(hotel) {
    this.hotelCode = hotel.hotelCode;
    this.hotelName = hotel.hotelName;
    this.address = hotel.address;
    this.website = hotel.website;
    this.email = hotel.email;
    this.tel = hotel.tel;
    this.whatsUp = hotel.whatsUp;
    this.sts = hotel.sts;
  }

  // الحصول على جميع الفنادق
  static async getAll() {
    try {
      const pool = await poolPromise;
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().query(`
        SELECT 
          HotelCode, HotelName, Address, Website, Email, Tel, WhatsUp, Sts
        FROM Hotel 
        ORDER BY HotelName
      `);

      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error fetching hotels:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على فندق واحد بواسطة الكود
  static async findByCode(hotelCode) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().input("hotelCode", sql.Int, hotelCode)
        .query(`
          SELECT 
            HotelCode, HotelName, Address, Website, Email, Tel, WhatsUp, Sts
          FROM Hotel 
          WHERE HotelCode = @hotelCode
        `);

      if (result.recordset.length === 0) {
        return { success: false, error: "Hotel not found" };
      }

      return { success: true, data: result.recordset[0] };
    } catch (err) {
      console.error("Error finding hotel:", err);
      return { success: false, error: err.message };
    }
  }

  // إنشاء فندق جديد
  static async create(newHotel, userName) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // تحقق إذا كانت هناك حقول إضافية في جدول الفنادق لتخزين معلومات المستخدم والتاريخ
      let hasUserFields = false;

      try {
        // التحقق من وجود الأعمدة في قاعدة البيانات
        const checkFields = await pool.request().query(`
          SELECT 
            COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'Hotel' 
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
          .input("hotelName", sql.NVarChar(100), newHotel.hotelName)
          .input("address", sql.NVarChar(200), newHotel.address)
          .input("website", sql.NVarChar(100), newHotel.website || null)
          .input("email", sql.NVarChar(100), newHotel.email || null)
          .input("tel", sql.NVarChar(50), newHotel.tel || null)
          .input("whatsUp", sql.NVarChar(50), newHotel.whatsUp || null)
          .input("sts", sql.Int, newHotel.sts || 1)
          .input("userName", sql.NVarChar(50), userName).query(`
            INSERT INTO Hotel (
              HotelName, Address, Website, Email, Tel, WhatsUp, Sts, User_Add, Date_Add
            )
            OUTPUT INSERTED.HotelCode
            VALUES (
              @hotelName, @address, @website, @email, @tel, @whatsUp, @sts, @userName, GETDATE()
            )
          `);
      } else {
        // إذا لم تكن الحقول موجودة، نستخدم الاستعلام العادي
        result = await pool
          .request()
          .input("hotelName", sql.NVarChar(100), newHotel.hotelName)
          .input("address", sql.NVarChar(200), newHotel.address)
          .input("website", sql.NVarChar(100), newHotel.website || null)
          .input("email", sql.NVarChar(100), newHotel.email || null)
          .input("tel", sql.NVarChar(50), newHotel.tel || null)
          .input("whatsUp", sql.NVarChar(50), newHotel.whatsUp || null)
          .input("sts", sql.Int, newHotel.sts || 1).query(`
            INSERT INTO Hotel (
              HotelName, Address, Website, Email, Tel, WhatsUp, Sts
            )
            OUTPUT INSERTED.HotelCode
            VALUES (
              @hotelName, @address, @website, @email, @tel, @whatsUp, @sts
            )
          `);
      }

      const hotelCode = result.recordset[0].HotelCode;
      return { success: true, data: { ...newHotel, hotelCode } };
    } catch (err) {
      console.error("Error creating hotel:", err);
      return { success: false, error: err.message };
    }
  }

  // تحديث فندق
  static async update(hotelCode, hotel, userName) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // تحقق إذا كانت هناك حقول إضافية في جدول الفنادق لتخزين معلومات المستخدم والتاريخ
      let hasUserFields = false;

      try {
        // التحقق من وجود الأعمدة في قاعدة البيانات
        const checkFields = await pool.request().query(`
          SELECT 
            COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'Hotel' 
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
          .input("hotelCode", sql.Int, hotelCode)
          .input("hotelName", sql.NVarChar(100), hotel.hotelName)
          .input("address", sql.NVarChar(200), hotel.address)
          .input("website", sql.NVarChar(100), hotel.website || null)
          .input("email", sql.NVarChar(100), hotel.email || null)
          .input("tel", sql.NVarChar(50), hotel.tel || null)
          .input("whatsUp", sql.NVarChar(50), hotel.whatsUp || null)
          .input("sts", sql.Int, hotel.sts || 1)
          .input("userName", sql.NVarChar(50), userName).query(`
            UPDATE Hotel
            SET 
              HotelName = @hotelName,
              Address = @address,
              Website = @website,
              Email = @email,
              Tel = @tel,
              WhatsUp = @whatsUp,
              Sts = @sts,
              User_Edit = @userName,
              Date_Edit = GETDATE()
            WHERE HotelCode = @hotelCode
          `);
      } else {
        // إذا لم تكن الحقول موجودة، نستخدم الاستعلام العادي
        await pool
          .request()
          .input("hotelCode", sql.Int, hotelCode)
          .input("hotelName", sql.NVarChar(100), hotel.hotelName)
          .input("address", sql.NVarChar(200), hotel.address)
          .input("website", sql.NVarChar(100), hotel.website || null)
          .input("email", sql.NVarChar(100), hotel.email || null)
          .input("tel", sql.NVarChar(50), hotel.tel || null)
          .input("whatsUp", sql.NVarChar(50), hotel.whatsUp || null)
          .input("sts", sql.Int, hotel.sts || 1).query(`
            UPDATE Hotel
            SET 
              HotelName = @hotelName,
              Address = @address,
              Website = @website,
              Email = @email,
              Tel = @tel,
              WhatsUp = @whatsUp,
              Sts = @sts
            WHERE HotelCode = @hotelCode
          `);
      }

      return { success: true, data: { ...hotel, hotelCode } };
    } catch (err) {
      console.error("Error updating hotel:", err);
      return { success: false, error: err.message };
    }
  }

  // حذف فندق
  static async delete(hotelCode) {
    try {
      const pool = await poolPromise;
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // التحقق من وجود رحلات مرتبطة بالفندق قبل الحذف
      const checkResult = await pool
        .request()
        .input("hotelCode", sql.Int, hotelCode).query(`
          SELECT COUNT(*) AS excursionCount FROM Excursions WHERE Hotel = @hotelCode
        `);

      const excursionCount = checkResult.recordset[0].excursionCount;
      if (excursionCount > 0) {
        return {
          success: false,
          error: `Cannot delete hotel: it is referenced by ${excursionCount} excursions`,
        };
      }

      await pool.request().input("hotelCode", sql.Int, hotelCode).query(`
          DELETE FROM Hotel WHERE HotelCode = @hotelCode
        `);

      return { success: true };
    } catch (err) {
      console.error("Error deleting hotel:", err);
      return { success: false, error: err.message };
    }
  }

  // البحث عن فنادق
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
            HotelCode, HotelName, Address, Website, Email, Tel, WhatsUp, Sts
          FROM Hotel 
          WHERE 
            HotelName LIKE @searchTerm OR
            Address LIKE @searchTerm OR
            Email LIKE @searchTerm OR
            Tel LIKE @searchTerm
          ORDER BY HotelName
        `);

      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error searching hotels:", err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = Hotel;
