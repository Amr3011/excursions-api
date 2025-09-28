// src/controllers/invhdrs.js
const InvHdr = require("../models/invhdr");

// الحصول على جميع الفواتير
exports.getAllInvHdrs = async (req, res, next) => {
  try {
    const result = await InvHdr.getAll();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على فاتورة واحدة بواسطة رقم الفاتورة
exports.getInvHdr = async (req, res, next) => {
  try {
    const result = await InvHdr.findByInvNo(req.params.invNo);

    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على الفواتير بواسطة كود العميل
exports.getInvHdrsByCustomer = async (req, res, next) => {
  try {
    const result = await InvHdr.findByCustomerCode(req.params.customerCode);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على الفواتير بواسطة تاريخ الحركة
exports.getInvHdrsByDate = async (req, res, next) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date is required in request body",
      });
    }

    const result = await InvHdr.findByTrafficDate(date);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// إنشاء فاتورة جديدة
exports.createInvHdr = async (req, res, next) => {
  try {
    const { InvNo, SrlNo, TrafficDate, CustomerCode, BoatCode, ExcursionCode } =
      req.body;

    // التحقق من البيانات المطلوبة
    if (!InvNo || !SrlNo || !TrafficDate || !CustomerCode) {
      return res.status(400).json({
        success: false,
        error: "InvNo, SrlNo, TrafficDate, and CustomerCode are required",
      });
    }

    const invhdrData = {
      InvNo,
      SrlNo,
      TrafficDate,
      CustomerCode,
      BoatCode,
      ExcursionCode,
    };

    const result = await InvHdr.create(invhdrData);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(201).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// تحديث فاتورة موجودة
exports.updateInvHdr = async (req, res, next) => {
  try {
    const { invNo } = req.params;
    const { SrlNo, TrafficDate, CustomerCode, BoatCode, ExcursionCode } =
      req.body;

    // التحقق من البيانات المطلوبة
    if (!SrlNo || !TrafficDate || !CustomerCode) {
      return res.status(400).json({
        success: false,
        error: "SrlNo, TrafficDate, and CustomerCode are required",
      });
    }

    const invhdrData = {
      SrlNo,
      TrafficDate,
      CustomerCode,
      BoatCode,
      ExcursionCode,
    };

    const result = await InvHdr.update(invNo, invhdrData);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// حذف فاتورة
exports.deleteInvHdr = async (req, res, next) => {
  try {
    const result = await InvHdr.delete(req.params.invNo);

    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

// الحصول على الفواتير بفترة تاريخية محددة
exports.getInvHdrsByDateRange = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        error: "FromDate and ToDate are required in query parameters",
      });
    }

    const result = await InvHdr.findByDateRange(fromDate, toDate);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({
      success: true,
      data: result.data,
      count: result.data.length,
    });
  } catch (err) {
    next(err);
  }
};

// الحصول على الفواتير الى فترتها تشمل التاريخ المحدد
exports.getInvHdrsByPeriod = async (req, res, next) => {
  try {
    const { FromDate, ToDate } = req.body;

    if (!FromDate || !ToDate) {
      return res.status(400).json({
        success: false,
        error: "FromDate and ToDate are required in request body",
      });
    }

    const result = await InvHdr.findByDateRange(FromDate, ToDate);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({
      success: true,
      data: result.data,
      count: result.data.length,
      dateRange: { FromDate, ToDate },
    });
  } catch (err) {
    next(err);
  }
};

// الحصول على الفواتير مجمعة حسب BoatCode في فترة زمنية
exports.getInvHdrsByDateRangeGrouped = async (req, res, next) => {
  try {
    const { FromDate, ToDate } = req.body;

    if (!FromDate || !ToDate) {
      return res.status(400).json({
        success: false,
        error: "FromDate and ToDate are required in request body",
      });
    }

    const result = await InvHdr.findByDateRangeGroupedByBoat(FromDate, ToDate);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    // حساب الإجمالي العام
    const grandTotal = result.data.reduce(
      (sum, boat) => sum + (boat.TotalAmount || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: result.data,
      summary: {
        totalBoats: result.data.length,
        grandTotal: grandTotal,
        dateRange: { FromDate, ToDate },
      },
    });
  } catch (err) {
    next(err);
  }
};
