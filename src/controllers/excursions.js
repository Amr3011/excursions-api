// src/controllers/excursions.js
const Excursion = require("../models/excursion");

// الحصول على جميع الرحلات
exports.getAllExcursions = async (req, res, next) => {
  try {
    const result = await Excursion.getAll();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على رحلة واحدة بواسطة رقم القسيمة
exports.getExcursion = async (req, res, next) => {
  try {
    const result = await Excursion.findByVoucherNo(req.params.voucherNo);

    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// إنشاء رحلة جديدة
exports.createExcursion = async (req, res, next) => {
  try {
    // الحصول على رقم القسيمة التالي
    const nextVoucherResult = await Excursion.getNextVoucherNo();

    if (!nextVoucherResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to get next voucher number",
      });
    }

    // استخراج بيانات الرحلة من طلب POST
    const {
      voucherDate,
      name,
      nationality,
      telephone,
      hotel,
      roomNo,
      customer,
      excursion,
      ad,
      child,
      inf,
      tripDate,
      tripTime,
      currency,
      price,
      paid,
      unpaid,
      receiver,
    } = req.body;

    // حساب إجمالي المسافرين
    const pax = parseInt(ad || 0) + parseInt(child || 0) + parseInt(inf || 0);

    // استخدام اسم المستخدم من رؤوس الطلب
    const userName = req.headers["x-user-login"] || "system";

    // إنشاء كائن الرحلة الجديدة مع رقم القسيمة التالي
    const newExcursion = new Excursion({
      voucherNo: nextVoucherResult.data,
      voucherDate,
      name,
      nationality,
      telephone,
      hotel,
      roomNo,
      customer,
      excursion,
      ad: ad || 0,
      child: child || 0,
      inf: inf || 0,
      pax,
      tripDate,
      tripTime,
      currency,
      price: price || 0,
      paid: paid || 0,
      unpaid: unpaid || 0,
      receiver,
      user_add: userName,
    });

    // حفظ الرحلة في قاعدة البيانات
    const result = await Excursion.create(newExcursion);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(201).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// تحديث رحلة
exports.updateExcursion = async (req, res, next) => {
  try {
    // التحقق من وجود الرحلة
    const checkResult = await Excursion.findByVoucherNo(req.params.voucherNo);

    if (!checkResult.success) {
      return res
        .status(404)
        .json({ success: false, error: "Excursion not found" });
    }

    // استخراج بيانات التحديث من طلب PUT
    const {
      voucherDate,
      name,
      nationality,
      telephone,
      hotel,
      roomNo,
      customer,
      excursion,
      ad,
      child,
      inf,
      tripDate,
      tripTime,
      currency,
      price,
      paid,
      unpaid,
      receiver,
    } = req.body;

    // حساب إجمالي المسافرين
    const pax = parseInt(ad || 0) + parseInt(child || 0) + parseInt(inf || 0);

    // استخدام اسم المستخدم من رؤوس الطلب
    const userName = req.headers["x-user-login"] || "system";

    // إنشاء كائن التحديث
    const updateData = {
      voucherDate,
      name,
      nationality,
      telephone,
      hotel,
      roomNo,
      customer,
      excursion,
      ad: ad || 0,
      child: child || 0,
      inf: inf || 0,
      pax,
      tripDate,
      tripTime,
      currency,
      price: price || 0,
      paid: paid || 0,
      unpaid: unpaid || 0,
      receiver,
    };

    // تحديث الرحلة في قاعدة البيانات
    const result = await Excursion.update(
      req.params.voucherNo,
      updateData,
      userName
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// حذف رحلة
exports.deleteExcursion = async (req, res, next) => {
  try {
    // التحقق من وجود الرحلة
    const checkResult = await Excursion.findByVoucherNo(req.params.voucherNo);

    if (!checkResult.success) {
      return res
        .status(404)
        .json({ success: false, error: "Excursion not found" });
    }

    // حذف الرحلة من قاعدة البيانات
    const result = await Excursion.delete(req.params.voucherNo);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// الحصول على قائمة الفنادق
exports.getHotels = async (req, res, next) => {
  try {
    const result = await Excursion.getHotels();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على قائمة الجنسيات
exports.getNationalities = async (req, res, next) => {
  try {
    const result = await Excursion.getNationalities();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على قائمة العملات
exports.getCurrencies = async (req, res, next) => {
  try {
    const result = await Excursion.getCurrencies();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على قائمة أنواع الرحلات
exports.getExcursionTypes = async (req, res, next) => {
  try {
    const result = await Excursion.getExcursionTypes();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على قائمة العملاء
exports.getCustomers = async (req, res, next) => {
  try {
    const result = await Excursion.getCustomers();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// البحث عن رحلات
exports.searchExcursions = async (req, res, next) => {
  try {
    const searchParams = req.query;
    const result = await Excursion.search(searchParams);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على رقم القسيمة التالي
exports.getNextVoucherNo = async (req, res, next) => {
  try {
    const result = await Excursion.getNextVoucherNo();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};
