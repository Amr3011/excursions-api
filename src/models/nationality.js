// src/models/nationality.js
const sql = require("mssql");
const db = require("../config/db");

class Nationality {
  constructor(nationality) {
    this.nationalityCode = nationality.nationalityCode;
    this.nationalityName = nationality.nationalityName;
    this.account = nationality.account;
  }

  // الحصول على جميع الجنسيات
  static async getAll() {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().query(`
        SELECT 
          NationalityCode, NationalityName, Account
        FROM Nationality 
        ORDER BY NationalityName
      `);

      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error fetching nationalities:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على جنسية واحدة بواسطة الكود
  static async findByCode(nationalityCode) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool
        .request()
        .input("nationalityCode", sql.Int, nationalityCode).query(`
          SELECT 
            NationalityCode, NationalityName, Account
          FROM Nationality 
          WHERE NationalityCode = @nationalityCode
        `);

      if (result.recordset.length === 0) {
        return { success: false, error: "Nationality not found" };
      }

      return { success: true, data: result.recordset[0] };
    } catch (err) {
      console.error("Error finding nationality:", err);
      return { success: false, error: err.message };
    }
  }

  // إنشاء جنسية جديدة
  static async create(newNationality, userName) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // تحقق إذا كانت هناك حقول إضافية في جدول الجنسيات لتخزين معلومات المستخدم والتاريخ
      let hasUserFields = false;

      try {
        // التحقق من وجود الأعمدة في قاعدة البيانات
        const checkFields = await pool.request().query(`
          SELECT 
            COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'Nationality' 
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
          .input(
            "nationalityName",
            sql.NVarChar(100),
            newNationality.nationalityName
          )
          .input("account", sql.NVarChar(50), newNationality.account || null)
          .input("userName", sql.NVarChar(50), userName).query(`
            INSERT INTO Nationality (
              NationalityName, Account, User_Add, Date_Add
            )
            OUTPUT INSERTED.NationalityCode
            VALUES (
              @nationalityName, @account, @userName, GETDATE()
            )
          `);
      } else {
        // إذا لم تكن الحقول موجودة، نستخدم الاستعلام العادي
        result = await pool
          .request()
          .input(
            "nationalityName",
            sql.NVarChar(100),
            newNationality.nationalityName
          )
          .input("account", sql.NVarChar(50), newNationality.account || null)
          .query(`
            INSERT INTO Nationality (
              NationalityName, Account
            )
            OUTPUT INSERTED.NationalityCode
            VALUES (
              @nationalityName, @account
            )
          `);
      }

      const nationalityCode = result.recordset[0].NationalityCode;
      return { success: true, data: { ...newNationality, nationalityCode } };
    } catch (err) {
      console.error("Error creating nationality:", err);
      return { success: false, error: err.message };
    }
  }

  // تحديث جنسية
  static async update(nationalityCode, nationality, userName) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // تحقق إذا كانت هناك حقول إضافية في جدول الجنسيات لتخزين معلومات المستخدم والتاريخ
      let hasUserFields = false;

      try {
        // التحقق من وجود الأعمدة في قاعدة البيانات
        const checkFields = await pool.request().query(`
          SELECT 
            COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'Nationality' 
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
          .input("nationalityCode", sql.Int, nationalityCode)
          .input(
            "nationalityName",
            sql.NVarChar(100),
            nationality.nationalityName
          )
          .input("account", sql.NVarChar(50), nationality.account || null)
          .input("userName", sql.NVarChar(50), userName).query(`
            UPDATE Nationality
            SET 
              NationalityName = @nationalityName,
              Account = @account,
              User_Edit = @userName,
              Date_Edit = GETDATE()
            WHERE NationalityCode = @nationalityCode
          `);
      } else {
        // إذا لم تكن الحقول موجودة، نستخدم الاستعلام العادي
        await pool
          .request()
          .input("nationalityCode", sql.Int, nationalityCode)
          .input(
            "nationalityName",
            sql.NVarChar(100),
            nationality.nationalityName
          )
          .input("account", sql.NVarChar(50), nationality.account || null)
          .query(`
            UPDATE Nationality
            SET 
              NationalityName = @nationalityName,
              Account = @account
            WHERE NationalityCode = @nationalityCode
          `);
      }

      return { success: true, data: { ...nationality, nationalityCode } };
    } catch (err) {
      console.error("Error updating nationality:", err);
      return { success: false, error: err.message };
    }
  }

  // حذف جنسية
  static async delete(nationalityCode) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // التحقق من وجود عملاء مرتبطين بالجنسية قبل الحذف
      const checkResult = await pool
        .request()
        .input("nationalityCode", sql.Int, nationalityCode).query(`
          SELECT COUNT(*) AS customerCount FROM Customers WHERE Nationality = @nationalityCode
        `);

      const customerCount = checkResult.recordset[0].customerCount || 0;
      if (customerCount > 0) {
        return {
          success: false,
          error: `Cannot delete nationality: it is referenced by ${customerCount} customers`,
        };
      }

      await pool.request().input("nationalityCode", sql.Int, nationalityCode)
        .query(`
          DELETE FROM Nationality WHERE NationalityCode = @nationalityCode
        `);

      return { success: true };
    } catch (err) {
      console.error("Error deleting nationality:", err);
      return { success: false, error: err.message };
    }
  }

  // البحث عن جنسيات
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
            NationalityCode, NationalityName, Account
          FROM Nationality 
          WHERE 
            NationalityName LIKE @searchTerm OR
            Account LIKE @searchTerm
          ORDER BY NationalityName
        `);

      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error searching nationalities:", err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = Nationality;
