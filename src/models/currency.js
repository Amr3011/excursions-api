// src/models/currency.js
const sql = require("mssql");
const db = require("../config/db");

class Currency {
  constructor(currency) {
    this.currencyCode = currency.currencyCode;
    this.currencyCode2 = currency.currencyCode2;
    this.currencyName = currency.currencyName;
  }

  // الحصول على جميع العملات
  static async getAll() {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().query(`
        SELECT 
          CurrencyCode, CurrencyCode2, CurrencyName
        FROM Currency 
        ORDER BY CurrencyName
      `);

      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error fetching currencies:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على عملة واحدة بواسطة الكود
  static async findByCode(currencyCode) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool
        .request()
        .input("currencyCode", sql.NVarChar(10), currencyCode).query(`
          SELECT 
            CurrencyCode, CurrencyCode2, CurrencyName
          FROM Currency 
          WHERE CurrencyCode = @currencyCode
        `);

      if (result.recordset.length === 0) {
        return { success: false, error: "Currency not found" };
      }

      return { success: true, data: result.recordset[0] };
    } catch (err) {
      console.error("Error finding currency:", err);
      return { success: false, error: err.message };
    }
  }

  // إنشاء عملة جديدة
  static async create(newCurrency, userName) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // تحقق إذا كانت هناك حقول إضافية في جدول العملات لتخزين معلومات المستخدم والتاريخ
      let hasUserFields = false;

      try {
        // التحقق من وجود الأعمدة في قاعدة البيانات
        const checkFields = await pool.request().query(`
          SELECT 
            COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'Currency' 
            AND COLUMN_NAME IN ('User_Add', 'Date_Add')
        `);

        hasUserFields = checkFields.recordset[0].count === 2;
      } catch (checkError) {
        console.error("Error checking columns:", checkError);
        hasUserFields = false;
      }

      // التحقق من عدم وجود عملة بنفس الكود
      const existingCurrency = await pool
        .request()
        .input("currencyCode", sql.NVarChar(10), newCurrency.currencyCode)
        .query(`
          SELECT COUNT(*) as count
          FROM Currency
          WHERE CurrencyCode = @currencyCode
        `);

      if (existingCurrency.recordset[0].count > 0) {
        return { success: false, error: "Currency code already exists" };
      }

      let query;

      if (hasUserFields) {
        query = `
          INSERT INTO Currency (
            CurrencyCode, CurrencyCode2, CurrencyName, User_Add, Date_Add
          )
          VALUES (
            @currencyCode, @currencyCode2, @currencyName, @userName, GETDATE()
          )
        `;
      } else {
        query = `
          INSERT INTO Currency (
            CurrencyCode, CurrencyCode2, CurrencyName
          )
          VALUES (
            @currencyCode, @currencyCode2, @currencyName
          )
        `;
      }

      await pool
        .request()
        .input("currencyCode", sql.NVarChar(10), newCurrency.currencyCode)
        .input(
          "currencyCode2",
          sql.NVarChar(10),
          newCurrency.currencyCode2 || null
        )
        .input("currencyName", sql.NVarChar(100), newCurrency.currencyName)
        .input("userName", sql.NVarChar(50), userName)
        .query(query);

      return { success: true, data: newCurrency };
    } catch (err) {
      console.error("Error creating currency:", err);
      return { success: false, error: err.message };
    }
  }

  // تحديث عملة
  static async update(currencyCode, currency, userName) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // تحقق إذا كانت هناك حقول إضافية في جدول العملات لتخزين معلومات المستخدم والتاريخ
      let hasUserFields = false;

      try {
        // التحقق من وجود الأعمدة في قاعدة البيانات
        const checkFields = await pool.request().query(`
          SELECT 
            COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'Currency' 
            AND COLUMN_NAME IN ('User_Edit', 'Date_Edit')
        `);

        hasUserFields = checkFields.recordset[0].count === 2;
      } catch (checkError) {
        console.error("Error checking columns:", checkError);
        hasUserFields = false;
      }

      // التحقق من وجود العملة
      const existingCurrency = await pool
        .request()
        .input("currencyCode", sql.NVarChar(10), currencyCode).query(`
          SELECT COUNT(*) as count
          FROM Currency
          WHERE CurrencyCode = @currencyCode
        `);

      if (existingCurrency.recordset[0].count === 0) {
        return { success: false, error: "Currency not found" };
      }

      let query;

      if (hasUserFields) {
        query = `
          UPDATE Currency
          SET 
            CurrencyCode2 = @currencyCode2,
            CurrencyName = @currencyName,
            User_Edit = @userName,
            Date_Edit = GETDATE()
          WHERE CurrencyCode = @currencyCode
        `;
      } else {
        query = `
          UPDATE Currency
          SET 
            CurrencyCode2 = @currencyCode2,
            CurrencyName = @currencyName
          WHERE CurrencyCode = @currencyCode
        `;
      }

      await pool
        .request()
        .input("currencyCode", sql.NVarChar(10), currencyCode)
        .input(
          "currencyCode2",
          sql.NVarChar(10),
          currency.currencyCode2 || null
        )
        .input("currencyName", sql.NVarChar(100), currency.currencyName)
        .input("userName", sql.NVarChar(50), userName)
        .query(query);

      return {
        success: true,
        data: {
          currencyCode,
          currencyCode2: currency.currencyCode2,
          currencyName: currency.currencyName,
        },
      };
    } catch (err) {
      console.error("Error updating currency:", err);
      return { success: false, error: err.message };
    }
  }

  // حذف عملة
  static async delete(currencyCode) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      // التحقق من وجود بيانات مرتبطة بالعملة قبل الحذف
      // مثال: إذا كان لديك جدول يستخدم هذه العملة
      const checkResult = await pool
        .request()
        .input("currencyCode", sql.NVarChar(10), currencyCode).query(`
          SELECT COUNT(*) AS usageCount 
          FROM Excursions 
          WHERE Currency = @currencyCode
        `);

      const usageCount = checkResult.recordset[0].usageCount || 0;
      if (usageCount > 0) {
        return {
          success: false,
          error: `Cannot delete currency: it is referenced by ${usageCount} excursions`,
        };
      }

      // قم بحذف العملة من قاعدة البيانات
      await pool.request().input("currencyCode", sql.NVarChar(10), currencyCode)
        .query(`
          DELETE FROM Currency WHERE CurrencyCode = @currencyCode
        `);

      return { success: true };
    } catch (err) {
      console.error("Error deleting currency:", err);
      return { success: false, error: err.message };
    }
  }

  // البحث عن عملات
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
            CurrencyCode, CurrencyCode2, CurrencyName
          FROM Currency 
          WHERE 
            CurrencyCode LIKE @searchTerm OR
            CurrencyCode2 LIKE @searchTerm OR
            CurrencyName LIKE @searchTerm
          ORDER BY CurrencyName
        `);

      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error searching currencies:", err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = Currency;
