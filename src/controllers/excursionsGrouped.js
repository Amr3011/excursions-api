// src/controllers/excursionsGrouped.js
const Excursions = require("../models/excursions");

// الحصول على جميع السجلات
exports.getAllExcursions = async (req, res, next) => {
  try {
    const result = await Excursions.getAll();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على السجلات بواسطة كود الفندق
exports.getExcursionsByHotel = async (req, res, next) => {
  try {
    const result = await Excursions.findByHotelCode(req.params.hotelCode);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على السجلات بواسطة تاريخ الفاوتشر
exports.getExcursionsByDate = async (req, res, next) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date is required in request body",
      });
    }

    const result = await Excursions.findByVoucherDate(date);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على السجلات بفترة تاريخية محددة
exports.getExcursionsByDateRange = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        error: "FromDate and ToDate are required in query parameters",
      });
    }

    const result = await Excursions.findByDateRange(fromDate, toDate);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({
      success: true,
      data: result.data,
      count: result.data.length,
      dateRange: { fromDate, toDate },
    });
  } catch (err) {
    next(err);
  }
};

// الحصول على السجلات بفترة تاريخية محددة
exports.getExcursionsByPeriod = async (req, res, next) => {
  try {
    let { FromDate, ToDate } = req.body;

    // إذا لم يتم تحديد التواريخ، استخدم نطاق شامل
    if (!FromDate) {
      FromDate = "1900-01-01"; // تاريخ قديم جداً
    }
    if (!ToDate) {
      ToDate = "2099-12-31"; // تاريخ بعيد جداً
    }

    const result = await Excursions.findByDateRangeGrouped(FromDate, ToDate);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    // حساب الإجماليات العامة مع تدوير الأرقام
    const totalPrice =
      Math.round(
        result.data.reduce((sum, item) => sum + (item.Price || 0), 0) * 100
      ) / 100;
    const totalPaid =
      Math.round(
        result.data.reduce((sum, item) => sum + (item.Paid || 0), 0) * 100
      ) / 100;
    const totalUnpaid =
      Math.round(
        result.data.reduce((sum, item) => sum + (item.Unpaid || 0), 0) * 100
      ) / 100;

    res.status(200).json({
      success: true,
      data: result.data,
      count: result.data.length,
      dateRange: { FromDate, ToDate },
      summary: {
        totalPrice: totalPrice,
        totalPaid: totalPaid,
        totalUnpaid: totalUnpaid,
        grandTotal: totalPaid + totalUnpaid,
      },
    });
  } catch (err) {
    next(err);
  }
};

// الحصول على السجلات مجمعة حسب HotelCode في فترة زمنية
exports.getExcursionsByDateRangeGrouped = async (req, res, next) => {
  try {
    let { FromDate, ToDate } = req.body;

    // إذا لم يتم تحديد التواريخ، استخدم نطاق شامل
    if (!FromDate) {
      FromDate = "1900-01-01"; // تاريخ قديم جداً
    }
    if (!ToDate) {
      ToDate = "2099-12-31"; // تاريخ بعيد جداً
    }

    if (false) {
      return res.status(400).json({
        success: false,
        error: "FromDate and ToDate are required in request body",
      });
    }

    const result = await Excursions.findByDateRangeGroupedByHotel(
      FromDate,
      ToDate
    );

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    // حساب الإجماليات العامة مع تدوير الأرقام
    const grandTotalPrice =
      Math.round(
        result.data.reduce((sum, hotel) => sum + (hotel.TotalPrice || 0), 0) *
          100
      ) / 100;
    const grandTotalPaid =
      Math.round(
        result.data.reduce((sum, hotel) => sum + (hotel.TotalPaid || 0), 0) *
          100
      ) / 100;
    const grandTotalUnpaid =
      Math.round(
        result.data.reduce((sum, hotel) => sum + (hotel.TotalUnpaid || 0), 0) *
          100
      ) / 100;

    res.status(200).json({
      success: true,
      data: result.data,
      summary: {
        totalHotels: result.data.length,
        grandTotalPrice: grandTotalPrice,
        grandTotalPaid: grandTotalPaid,
        grandTotalUnpaid: grandTotalUnpaid,
        grandTotal: grandTotalPaid + grandTotalUnpaid,
        dateRange: { FromDate, ToDate },
      },
    });
  } catch (err) {
    next(err);
  }
};

// إنشاء سجل جديد
exports.createExcursion = async (req, res, next) => {
  try {
    const { VoucherDate, HotelCode, Price, Paid, Unpaid } = req.body;

    // التحقق من البيانات المطلوبة
    if (!VoucherDate || !HotelCode) {
      return res.status(400).json({
        success: false,
        error: "VoucherDate and HotelCode are required",
      });
    }

    const excursionData = {
      VoucherDate,
      HotelCode,
      Price,
      Paid,
      Unpaid,
    };

    const result = await Excursions.create(excursionData);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(201).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

// تحديث سجل موجود
exports.updateExcursion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { VoucherDate, HotelCode, Price, Paid, Unpaid } = req.body;

    // التحقق من البيانات المطلوبة
    if (!VoucherDate || !HotelCode) {
      return res.status(400).json({
        success: false,
        error: "VoucherDate and HotelCode are required",
      });
    }

    const excursionData = {
      VoucherDate,
      HotelCode,
      Price,
      Paid,
      Unpaid,
    };

    const result = await Excursions.update(id, excursionData);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

// حذف سجل
exports.deleteExcursion = async (req, res, next) => {
  try {
    const result = await Excursions.delete(req.params.id);

    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};
