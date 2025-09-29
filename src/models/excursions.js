// src/models/excursions.js
const sql = require("mssql");
const db = require("../config/db");

class Excursions {
  constructor(excursion) {
    this.VoucherDate = excursion.VoucherDate;
    this.Hotel = excursion.Hotel;
    this.Price = excursion.Price;
    this.Paid = excursion.Paid;
    this.Unpaid = excursion.Unpaid;
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
          e.VoucherDate,
          e.Hotel,
          h.HotelName,
          e.Price,
          e.Paid,
          e.Unpaid
        FROM Excursions e
        LEFT JOIN Hotel h ON e.Hotel = h.HotelCode
        ORDER BY e.VoucherDate DESC
      `;

      const result = await request.query(query);
      return { success: true, data: result.recordset };
    } catch (error) {
      console.error("Error in Excursions.getAll:", error);
      return { success: false, error: error.message };
    }
  }

  // البحث بواسطة كود الفندق
  static async findByHotelCode(hotelCode) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      request.input("HotelCode", sql.VarChar, hotelCode);

      const query = `
        SELECT 
          e.VoucherDate,
          e.Hotel,
          h.HotelName,
          e.Price,
          e.Paid,
          e.Unpaid
        FROM Excursions e
        LEFT JOIN Hotel h ON e.Hotel = h.HotelCode
        WHERE e.Hotel = @HotelCode
        ORDER BY e.VoucherDate DESC
      `;

      const result = await request.query(query);
      return { success: true, data: result.recordset };
    } catch (error) {
      console.error("Error in Excursions.findByHotelCode:", error);
      return { success: false, error: error.message };
    }
  }

  // البحث بواسطة تاريخ الفاوتشر
  static async findByVoucherDate(voucherDate) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      request.input("VoucherDate", sql.DateTime, voucherDate);

      const query = `
        SELECT 
          e.VoucherDate,
          e.Hotel,
          h.HotelName,
          e.Price,
          e.Paid,
          e.Unpaid
        FROM Excursions e
        LEFT JOIN Hotel h ON e.Hotel = h.HotelCode
        WHERE CAST(e.VoucherDate AS DATE) = CAST(@VoucherDate AS DATE)
        ORDER BY e.VoucherDate DESC
      `;

      const result = await request.query(query);
      return { success: true, data: result.recordset };
    } catch (error) {
      console.error("Error in Excursions.findByVoucherDate:", error);
      return { success: false, error: error.message };
    }
  }

  // البحث بفترة تاريخية محددة
  static async findByDateRange(fromDate, toDate) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      request.input("FromDate", sql.Date, fromDate);
      request.input("ToDate", sql.Date, toDate);

      const query = `
        SELECT 
          e.VoucherDate,
          e.Hotel,
          h.HotelName,
          e.Price,
          e.Paid,
          e.Unpaid
        FROM Excursions e
        LEFT JOIN Hotel h ON e.Hotel = h.HotelCode
        WHERE e.VoucherDate >= @FromDate AND e.VoucherDate <= @ToDate
        ORDER BY e.VoucherDate DESC
      `;

      const result = await request.query(query);
      return { success: true, data: result.recordset };
    } catch (error) {
      console.error("Error in Excursions.findByDateRange:", error);
      return { success: false, error: error.message };
    }
  }

  // البحث بفترة تاريخية مع التجميع حسب الفندق فقط (للـ period endpoint)
  static async findByDateRangeGrouped(fromDate, toDate) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      request.input("FromDate", sql.Date, fromDate);
      request.input("ToDate", sql.Date, toDate);

      const query = `
        SELECT 
          e.Hotel,
          h.HotelName,
          SUM(ISNULL(e.Price, 0)) as Price,
          SUM(ISNULL(e.Paid, 0)) as Paid,
          SUM(ISNULL(e.Unpaid, 0)) as Unpaid,
          COUNT(*) as RecordCount,
          MIN(e.VoucherDate) as FirstDate,
          MAX(e.VoucherDate) as LastDate
        FROM Excursions e
        LEFT JOIN Hotel h ON e.Hotel = h.HotelCode
        WHERE e.VoucherDate >= @FromDate AND e.VoucherDate <= @ToDate
        GROUP BY e.Hotel, h.HotelName
        ORDER BY SUM(ISNULL(e.Price, 0)) DESC
      `;

      const result = await request.query(query);

      // حساب الإجماليات العامة
      const totalPaid = result.recordset.reduce(
        (sum, record) => sum + (record.Paid || 0),
        0
      );
      const totalUnpaid = result.recordset.reduce(
        (sum, record) => sum + (record.Unpaid || 0),
        0
      );
      const grandTotal = totalPaid + totalUnpaid;

      return {
        success: true,
        data: result.recordset,
        summary: {
          totalPaid: totalPaid,
          totalUnpaid: totalUnpaid,
          grandTotal: grandTotal,
          totalRecords: result.recordset.length,
        },
      };
    } catch (error) {
      console.error("Error in Excursions.findByDateRangeGrouped:", error);
      return { success: false, error: error.message };
    }
  }

  // البحث بفترة تاريخية مع التجميع حسب HotelCode
  static async findByDateRangeGroupedByHotel(fromDate, toDate) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      request.input("FromDate", sql.Date, fromDate);
      request.input("ToDate", sql.Date, toDate);

      // الاستعلام الأول للحصول على البيانات المجمعة حسب رقم الفندق
      const groupQuery = `
        SELECT 
          e.Hotel,
          h.HotelName,
          COUNT(*) as RecordCount,
          SUM(ISNULL(e.Price, 0)) as TotalPrice,
          SUM(ISNULL(e.Paid, 0)) as TotalPaid,
          SUM(ISNULL(e.Unpaid, 0)) as TotalUnpaid,
          MIN(e.VoucherDate) as FirstDate,
          MAX(e.VoucherDate) as LastDate
        FROM Excursions e
        LEFT JOIN Hotel h ON e.Hotel = h.HotelCode
        WHERE e.VoucherDate >= @FromDate AND e.VoucherDate <= @ToDate
          AND e.Hotel IS NOT NULL
        GROUP BY e.Hotel, h.HotelName
        ORDER BY SUM(ISNULL(e.Price, 0)) DESC
      `;

      const groupResult = await request.query(groupQuery);

      // الاستعلام الثاني للحصول على تواريخ الفواتشر لكل فندق
      const dateQuery = `
        SELECT 
          e.Hotel,
          e.VoucherDate
        FROM Excursions e
        WHERE e.VoucherDate >= @FromDate AND e.VoucherDate <= @ToDate
          AND e.Hotel IS NOT NULL
        ORDER BY e.Hotel, e.VoucherDate
      `;

      const request2 = pool.request();
      request2.input("FromDate", sql.Date, fromDate);
      request2.input("ToDate", sql.Date, toDate);
      const dateResult = await request2.query(dateQuery);

      // تجميع التواريخ حسب رقم الفندق
      const datesByHotel = {};
      dateResult.recordset.forEach((record) => {
        if (!datesByHotel[record.Hotel]) {
          datesByHotel[record.Hotel] = [];
        }
        const dateStr = new Date(record.VoucherDate)
          .toISOString()
          .split("T")[0];
        if (!datesByHotel[record.Hotel].includes(dateStr)) {
          datesByHotel[record.Hotel].push(dateStr);
        }
      }); // دمج البيانات
      const finalData = groupResult.recordset.map((hotel) => ({
        ...hotel,
        VoucherDates: datesByHotel[hotel.Hotel]
          ? datesByHotel[hotel.Hotel].join(", ")
          : "",
      }));

      return { success: true, data: finalData };
    } catch (error) {
      console.error(
        "Error in Excursions.findByDateRangeGroupedByHotel:",
        error
      );
      return { success: false, error: error.message };
    }
  }

  // إنشاء سجل جديد
  static async create(excursionData) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      // إضافة المعاملات
      request.input("VoucherDate", sql.DateTime, excursionData.VoucherDate);
      request.input("Hotel", sql.VarChar, excursionData.Hotel);
      request.input("Price", sql.Decimal(18, 2), excursionData.Price || 0);
      request.input("Paid", sql.Decimal(18, 2), excursionData.Paid || 0);
      request.input("Unpaid", sql.Decimal(18, 2), excursionData.Unpaid || 0);

      const query = `
        INSERT INTO Excursions (VoucherDate, Hotel, Price, Paid, Unpaid)
        VALUES (@VoucherDate, @Hotel, @Price, @Paid, @Unpaid)
      `;

      await request.query(query);
      return {
        success: true,
        message: "Excursion record created successfully",
      };
    } catch (error) {
      console.error("Error in Excursions.create:", error);
      return { success: false, error: error.message };
    }
  }

  // تحديث سجل موجود
  static async update(id, excursionData) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      // إضافة المعاملات
      request.input("Id", sql.Int, id);
      request.input("VoucherDate", sql.DateTime, excursionData.VoucherDate);
      request.input("Hotel", sql.VarChar, excursionData.Hotel);
      request.input("Price", sql.Decimal(18, 2), excursionData.Price || 0);
      request.input("Paid", sql.Decimal(18, 2), excursionData.Paid || 0);
      request.input("Unpaid", sql.Decimal(18, 2), excursionData.Unpaid || 0);

      const query = `
        UPDATE Excursions 
        SET VoucherDate = @VoucherDate,
            Hotel = @Hotel,
            Price = @Price,
            Paid = @Paid,
            Unpaid = @Unpaid
        WHERE Id = @Id
      `;

      const result = await request.query(query);

      if (result.rowsAffected[0] === 0) {
        return { success: false, error: "Excursion record not found" };
      }

      return {
        success: true,
        message: "Excursion record updated successfully",
      };
    } catch (error) {
      console.error("Error in Excursions.update:", error);
      return { success: false, error: error.message };
    }
  }

  // حذف سجل
  static async delete(id) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }
      const request = pool.request();

      request.input("Id", sql.Int, id);

      const query = `DELETE FROM Excursions WHERE Id = @Id`;
      const result = await request.query(query);

      if (result.rowsAffected[0] === 0) {
        return { success: false, error: "Excursion record not found" };
      }

      return {
        success: true,
        message: "Excursion record deleted successfully",
      };
    } catch (error) {
      console.error("Error in Excursions.delete:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = Excursions;
