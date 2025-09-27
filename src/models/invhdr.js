// src/models/invhdr.js
const sql = require("mssql");
const db = require("../config/db");

class InvHdr {
  constructor(invhdr) {
    this.InvNo = invhdr.InvNo;
    this.SrlNo = invhdr.SrlNo;
    this.TrafficDate = invhdr.TrafficDate;
    this.CustomerCode = invhdr.CustomerCode;
    this.BoatCode = invhdr.BoatCode;
    this.ExcursionCode = invhdr.ExcursionCode;
  }

  // الحصول على جميع السجلات
  static async getAll() {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      const query = `
        SELECT 
          ih.InvNo,
          ih.SrlNo,
          ih.TrafficDate,
          ih.CustomerCode,
          c.CustomerName,
          ih.BoatCode,
          b.BoatName,
          ih.ExcursionCode,
          r.RoadName,
          ih.Currency,
          cur.CurrencyName,
          ih.GTotal
        FROM InvHdr ih
        LEFT JOIN Customer c ON ih.CustomerCode = c.CustomerCode
        LEFT JOIN Boat b ON ih.BoatCode = b.BoatCode
        LEFT JOIN Road r ON ih.ExcursionCode = r.RoadCode
        LEFT JOIN Currency cur ON ih.Currency = cur.CurrencyCode
        ORDER BY ih.InvNo DESC
      `;

      const result = await request.query(query);
      return { success: true, data: result.recordset };
    } catch (error) {
      console.error("Error in InvHdr.getAll:", error);
      return { success: false, error: error.message };
    }
  }

  // البحث بواسطة رقم الفاتورة
  static async findByInvNo(invNo) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      request.input("InvNo", sql.VarChar, invNo);

      const query = `
        SELECT 
          ih.InvNo,
          ih.SrlNo,
          ih.TrafficDate,
          ih.CustomerCode,
          c.CustomerName,
          ih.BoatCode,
          b.BoatName,
          ih.ExcursionCode,
          r.RoadName,
          ih.Currency,
          cur.CurrencyName,
          ih.GTotal
        FROM InvHdr ih
        LEFT JOIN Customer c ON ih.CustomerCode = c.CustomerCode
        LEFT JOIN Boat b ON ih.BoatCode = b.BoatCode
        LEFT JOIN Road r ON ih.ExcursionCode = r.RoadCode
        LEFT JOIN Currency cur ON ih.Currency = cur.CurrencyCode
        WHERE ih.InvNo = @InvNo
      `;

      const result = await request.query(query);

      if (result.recordset.length === 0) {
        return { success: false, error: "Invoice not found" };
      }

      return { success: true, data: result.recordset[0] };
    } catch (error) {
      console.error("Error in InvHdr.findByInvNo:", error);
      return { success: false, error: error.message };
    }
  }

  // البحث بواسطة كود العميل
  static async findByCustomerCode(customerCode) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      request.input("CustomerCode", sql.VarChar, customerCode);

      const query = `
        SELECT 
          ih.InvNo,
          ih.SrlNo,
          ih.TrafficDate,
          ih.CustomerCode,
          c.CustomerName,
          ih.BoatCode,
          b.BoatName,
          ih.ExcursionCode,
          r.RoadName,
          ih.Currency,
          cur.CurrencyName,
          ih.GTotal
        FROM InvHdr ih
        LEFT JOIN Customer c ON ih.CustomerCode = c.CustomerCode
        LEFT JOIN Boat b ON ih.BoatCode = b.BoatCode
        LEFT JOIN Road r ON ih.ExcursionCode = r.RoadCode
        LEFT JOIN Currency cur ON ih.Currency = cur.CurrencyCode
        WHERE ih.CustomerCode = @CustomerCode
        ORDER BY ih.InvNo DESC
      `;

      const result = await request.query(query);
      return { success: true, data: result.recordset };
    } catch (error) {
      console.error("Error in InvHdr.findByCustomerCode:", error);
      return { success: false, error: error.message };
    }
  }

  // البحث بواسطة تاريخ الحركة
  static async findByTrafficDate(trafficDate) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      request.input("TrafficDate", sql.DateTime, trafficDate);

      const query = `
        SELECT 
          ih.InvNo,
          ih.SrlNo,
          ih.TrafficDate,
          ih.CustomerCode,
          c.CustomerName,
          ih.BoatCode,
          b.BoatName,
          ih.ExcursionCode,
          r.RoadName,
          ih.Currency,
          cur.CurrencyName,
          ih.GTotal
        FROM InvHdr ih
        LEFT JOIN Customer c ON ih.CustomerCode = c.CustomerCode
        LEFT JOIN Boat b ON ih.BoatCode = b.BoatCode
        LEFT JOIN Road r ON ih.ExcursionCode = r.RoadCode
        LEFT JOIN Currency cur ON ih.Currency = cur.CurrencyCode
        WHERE CAST(ih.TrafficDate AS DATE) = CAST(@TrafficDate AS DATE)
        ORDER BY ih.InvNo DESC
      `;

      const result = await request.query(query);
      return { success: true, data: result.recordset };
    } catch (error) {
      console.error("Error in InvHdr.findByTrafficDate:", error);
      return { success: false, error: error.message };
    }
  }

  // إنشاء سجل جديد
  static async create(invhdrData) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      // إضافة المعاملات
      request.input("InvNo", sql.VarChar, invhdrData.InvNo);
      request.input("SrlNo", sql.Int, invhdrData.SrlNo);
      request.input("TrafficDate", sql.DateTime, invhdrData.TrafficDate);
      request.input("CustomerCode", sql.VarChar, invhdrData.CustomerCode);
      request.input("BoatCode", sql.VarChar, invhdrData.BoatCode || null);
      request.input(
        "ExcursionCode",
        sql.VarChar,
        invhdrData.ExcursionCode || null
      );

      const query = `
        INSERT INTO InvHdr (InvNo, SrlNo, TrafficDate, CustomerCode, BoatCode, ExcursionCode)
        VALUES (@InvNo, @SrlNo, @TrafficDate, @CustomerCode, @BoatCode, @ExcursionCode)
      `;

      await request.query(query);

      // إرجاع السجل المُنشأ
      return await this.findByInvNo(invhdrData.InvNo);
    } catch (error) {
      console.error("Error in InvHdr.create:", error);
      return { success: false, error: error.message };
    }
  }

  // تحديث سجل موجود
  static async update(invNo, invhdrData) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      // إضافة المعاملات
      request.input("InvNo", sql.VarChar, invNo);
      request.input("SrlNo", sql.Int, invhdrData.SrlNo);
      request.input("TrafficDate", sql.DateTime, invhdrData.TrafficDate);
      request.input("CustomerCode", sql.VarChar, invhdrData.CustomerCode);
      request.input("BoatCode", sql.VarChar, invhdrData.BoatCode || null);
      request.input(
        "ExcursionCode",
        sql.VarChar,
        invhdrData.ExcursionCode || null
      );

      const query = `
        UPDATE InvHdr 
        SET SrlNo = @SrlNo,
            TrafficDate = @TrafficDate,
            CustomerCode = @CustomerCode,
            BoatCode = @BoatCode,
            ExcursionCode = @ExcursionCode
        WHERE InvNo = @InvNo
      `;

      const result = await request.query(query);

      if (result.rowsAffected[0] === 0) {
        return { success: false, error: "Invoice not found" };
      }

      // إرجاع السجل المُحدث
      return await this.findByInvNo(invNo);
    } catch (error) {
      console.error("Error in InvHdr.update:", error);
      return { success: false, error: error.message };
    }
  }

  // حذف سجل
  static async delete(invNo) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      request.input("InvNo", sql.VarChar, invNo);

      const query = `DELETE FROM InvHdr WHERE InvNo = @InvNo`;
      const result = await request.query(query);

      if (result.rowsAffected[0] === 0) {
        return { success: false, error: "Invoice not found" };
      }

      return { success: true, message: "Invoice deleted successfully" };
    } catch (error) {
      console.error("Error in InvHdr.delete:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = InvHdr;
