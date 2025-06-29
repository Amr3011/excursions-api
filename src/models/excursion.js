// src/models/excursion.js
const sql = require("mssql");
const db = require("../config/db");

class Excursion {
  constructor(excursion) {
    this.voucherNo = excursion.voucherNo;
    this.voucherDate = excursion.voucherDate;
    this.name = excursion.name;
    this.nationality = excursion.nationality;
    this.telephone = excursion.telephone;
    this.hotel = excursion.hotel;
    this.roomNo = excursion.roomNo;
    this.customer = excursion.customer;
    this.excursion = excursion.excursion;
    this.ad = excursion.ad;
    this.child = excursion.child;
    this.inf = excursion.inf;
    this.pax = excursion.pax;
    this.tripDate = excursion.tripDate;
    this.tripTime = excursion.tripTime;
    this.currency = excursion.currency;
    this.price = excursion.price;
    this.paid = excursion.paid;
    this.unpaid = excursion.unpaid;
    this.receiver = excursion.receiver;
    this.user_add = excursion.user_add;
    this.user_edit = excursion.user_edit;
  }

  // إنشاء رحلة جديدة
  static async create(newExcursion) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool
        .request()
        .input("voucherNo", sql.Numeric(10, 0), newExcursion.voucherNo)
        .input("voucherDate", sql.Date, newExcursion.voucherDate)
        .input("name", sql.NChar(100), newExcursion.name)
        .input("nationality", sql.Int, newExcursion.nationality)
        .input("telephone", sql.NChar(15), newExcursion.telephone)
        .input("hotel", sql.Int, newExcursion.hotel)
        .input("roomNo", sql.NChar(15), newExcursion.roomNo)
        .input("customer", sql.Int, newExcursion.customer)
        .input("excursion", sql.Int, newExcursion.excursion)
        .input("ad", sql.Int, newExcursion.ad)
        .input("child", sql.Int, newExcursion.child)
        .input("inf", sql.Int, newExcursion.inf)
        .input("pax", sql.Int, newExcursion.pax)
        .input("tripDate", sql.Date, newExcursion.tripDate)
        .input("tripTime", sql.NChar(10), newExcursion.tripTime)
        .input("currency", sql.Int, newExcursion.currency)
        .input("price", sql.Money, newExcursion.price)
        .input("paid", sql.Money, newExcursion.paid)
        .input("unpaid", sql.Money, newExcursion.unpaid)
        .input("receiver", sql.NChar(100), newExcursion.receiver)
        .input("user_add", sql.NChar(25), newExcursion.user_add).query(`
          INSERT INTO Excursions (
            VoucherNo, VoucherDate, Name, Nationality, Telephone, Hotel,
            RoomNo, Customer, Excursion, Ad, Child, Inf, Pax,
            TripDate, TripTime, Currency, Price, Paid, Unpaid,
            Receiver, User_Add
          )
          VALUES (
            @voucherNo, @voucherDate, @name, @nationality, @telephone, @hotel,
            @roomNo, @customer, @excursion, @ad, @child, @inf, @pax,
            @tripDate, @tripTime, @currency, @price, @paid, @unpaid,
            @receiver, @user_add
          )
        `);

      return { success: true, data: newExcursion };
    } catch (err) {
      console.error("Error creating excursion:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على جميع الرحلات
  static async getAll() {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().query(`
        SELECT 
          e.VoucherNo, e.VoucherDate, e.Name, n.NationalityName, e.Telephone, 
          h.HotelName, e.RoomNo, c.CustomerName, ex.ExcursionName,
          e.Ad, e.Child, e.Inf, e.Pax, e.TripDate, e.TripTime,
          cu.CurrencyName, e.Price, e.Paid, e.Unpaid, e.Receiver,
          e.User_Add, e.User_Edit
        FROM Excursions e
        LEFT JOIN Nationalities n ON e.Nationality = n.NationalityID
        LEFT JOIN Hotels h ON e.Hotel = h.HotelID
        LEFT JOIN Customers c ON e.Customer = c.CustomerID
        LEFT JOIN ExcursionTypes ex ON e.Excursion = ex.ExcursionID
        LEFT JOIN Currencies cu ON e.Currency = cu.CurrencyID
        ORDER BY e.VoucherDate DESC
      `);
      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error fetching excursions:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على رحلة واحدة بواسطة رقم القسيمة
  static async findByVoucherNo(voucherNo) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool
        .request()
        .input("voucherNo", sql.Numeric(10, 0), voucherNo).query(`
          SELECT 
            e.VoucherNo, e.VoucherDate, e.Name, e.Nationality, n.NationalityName, 
            e.Telephone, e.Hotel, h.HotelName, e.RoomNo, e.Customer, 
            c.CustomerName, e.Excursion, ex.ExcursionName,
            e.Ad, e.Child, e.Inf, e.Pax, e.TripDate, e.TripTime,
            e.Currency, cu.CurrencyName, e.Price, e.Paid, e.Unpaid, e.Receiver,
            e.User_Add, e.User_Edit
          FROM Excursions e
          LEFT JOIN Nationalities n ON e.Nationality = n.NationalityID
          LEFT JOIN Hotels h ON e.Hotel = h.HotelID
          LEFT JOIN Customers c ON e.Customer = c.CustomerID
          LEFT JOIN ExcursionTypes ex ON e.Excursion = ex.ExcursionID
          LEFT JOIN Currencies cu ON e.Currency = cu.CurrencyID
          WHERE e.VoucherNo = @voucherNo
        `);

      if (result.recordset.length === 0) {
        return { success: false, error: "Excursion not found" };
      }

      return { success: true, data: result.recordset[0] };
    } catch (err) {
      console.error("Error finding excursion:", err);
      return { success: false, error: err.message };
    }
  }

  // تحديث رحلة
  static async update(voucherNo, excursion, userName) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      await pool
        .request()
        .input("voucherNo", sql.Numeric(10, 0), voucherNo)
        .input("voucherDate", sql.Date, excursion.voucherDate)
        .input("name", sql.NChar(100), excursion.name)
        .input("nationality", sql.Int, excursion.nationality)
        .input("telephone", sql.NChar(15), excursion.telephone)
        .input("hotel", sql.Int, excursion.hotel)
        .input("roomNo", sql.NChar(15), excursion.roomNo)
        .input("customer", sql.Int, excursion.customer)
        .input("excursion", sql.Int, excursion.excursion)
        .input("ad", sql.Int, excursion.ad)
        .input("child", sql.Int, excursion.child)
        .input("inf", sql.Int, excursion.inf)
        .input("pax", sql.Int, excursion.pax)
        .input("tripDate", sql.Date, excursion.tripDate)
        .input("tripTime", sql.NChar(10), excursion.tripTime)
        .input("currency", sql.Int, excursion.currency)
        .input("price", sql.Money, excursion.price)
        .input("paid", sql.Money, excursion.paid)
        .input("unpaid", sql.Money, excursion.unpaid)
        .input("receiver", sql.NChar(100), excursion.receiver)
        .input("user_edit", sql.NChar(25), userName).query(`
          UPDATE Excursions
          SET
            VoucherDate = @voucherDate,
            Name = @name,
            Nationality = @nationality,
            Telephone = @telephone,
            Hotel = @hotel,
            RoomNo = @roomNo,
            Customer = @customer,
            Excursion = @excursion,
            Ad = @ad,
            Child = @child,
            Inf = @inf,
            Pax = @pax,
            TripDate = @tripDate,
            TripTime = @tripTime,
            Currency = @currency,
            Price = @price,
            Paid = @paid,
            Unpaid = @unpaid,
            Receiver = @receiver,
            User_Edit = @user_edit
          WHERE VoucherNo = @voucherNo
        `);

      return { success: true, data: excursion };
    } catch (err) {
      console.error("Error updating excursion:", err);
      return { success: false, error: err.message };
    }
  }

  // حذف رحلة
  static async delete(voucherNo) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      await pool.request().input("voucherNo", sql.Numeric(10, 0), voucherNo)
        .query(`
          DELETE FROM Excursions WHERE VoucherNo = @voucherNo
        `);

      return { success: true };
    } catch (err) {
      console.error("Error deleting excursion:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على قائمة الفنادق
  static async getHotels() {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().query(`
        SELECT HotelID, HotelName FROM Hotels ORDER BY HotelName
      `);
      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error fetching hotels:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على قائمة الجنسيات
  static async getNationalities() {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().query(`
        SELECT NationalityID, NationalityName FROM Nationalities ORDER BY NationalityName
      `);
      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error fetching nationalities:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على قائمة العملات
  static async getCurrencies() {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().query(`
        SELECT CurrencyID, CurrencyName FROM Currencies ORDER BY CurrencyName
      `);
      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error fetching currencies:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على قائمة أنواع الرحلات
  static async getExcursionTypes() {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().query(`
        SELECT ExcursionID, ExcursionName FROM ExcursionTypes ORDER BY ExcursionName
      `);
      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error fetching excursion types:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على قائمة العملاء
  static async getCustomers() {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().query(`
        SELECT CustomerID, CustomerName FROM Customers ORDER BY CustomerName
      `);
      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error fetching customers:", err);
      return { success: false, error: err.message };
    }
  }

  // البحث عن رحلات
  static async search(searchParams) {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      let query = `
        SELECT 
          e.VoucherNo, e.VoucherDate, e.Name, n.NationalityName, e.Telephone, 
          h.HotelName, e.RoomNo, c.CustomerName, ex.ExcursionName,
          e.Ad, e.Child, e.Inf, e.Pax, e.TripDate, e.TripTime,
          cu.CurrencyName, e.Price, e.Paid, e.Unpaid, e.Receiver,
          e.User_Add, e.User_Edit
        FROM Excursions e
        LEFT JOIN Nationalities n ON e.Nationality = n.NationalityID
        LEFT JOIN Hotels h ON e.Hotel = h.HotelID
        LEFT JOIN Customers c ON e.Customer = c.CustomerID
        LEFT JOIN ExcursionTypes ex ON e.Excursion = ex.ExcursionID
        LEFT JOIN Currencies cu ON e.Currency = cu.CurrencyID
        WHERE 1=1
      `;

      const request = pool.request();

      if (searchParams.voucherNo) {
        query += ` AND e.VoucherNo = @voucherNo`;
        request.input("voucherNo", sql.Numeric(10, 0), searchParams.voucherNo);
      }

      if (searchParams.name) {
        query += ` AND e.Name LIKE @name`;
        request.input("name", sql.NChar(100), `%${searchParams.name}%`);
      }

      if (searchParams.hotel) {
        query += ` AND e.Hotel = @hotel`;
        request.input("hotel", sql.Int, searchParams.hotel);
      }

      if (searchParams.nationality) {
        query += ` AND e.Nationality = @nationality`;
        request.input("nationality", sql.Int, searchParams.nationality);
      }

      if (searchParams.excursion) {
        query += ` AND e.Excursion = @excursion`;
        request.input("excursion", sql.Int, searchParams.excursion);
      }

      if (searchParams.startDate && searchParams.endDate) {
        query += ` AND e.TripDate BETWEEN @startDate AND @endDate`;
        request.input("startDate", sql.Date, searchParams.startDate);
        request.input("endDate", sql.Date, searchParams.endDate);
      } else if (searchParams.startDate) {
        query += ` AND e.TripDate >= @startDate`;
        request.input("startDate", sql.Date, searchParams.startDate);
      } else if (searchParams.endDate) {
        query += ` AND e.TripDate <= @endDate`;
        request.input("endDate", sql.Date, searchParams.endDate);
      }

      query += ` ORDER BY e.TripDate DESC`;

      const result = await request.query(query);
      return { success: true, data: result.recordset };
    } catch (err) {
      console.error("Error searching excursions:", err);
      return { success: false, error: err.message };
    }
  }

  // الحصول على رقم القسيمة التالي
  static async getNextVoucherNo() {
    try {
      const pool = await db.createConnection();
      if (!pool) {
        return { success: false, error: "Database connection failed" };
      }

      const result = await pool.request().query(`
        SELECT MAX(VoucherNo) AS MaxVoucherNo FROM Excursions
      `);

      const maxVoucherNo = result.recordset[0].MaxVoucherNo || 0;
      return { success: true, data: maxVoucherNo + 1 };
    } catch (err) {
      console.error("Error getting next voucher number:", err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = Excursion;
