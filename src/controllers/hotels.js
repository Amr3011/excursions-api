// src/controllers/hotels.js
const Hotel = require("../models/hotel");
const { getCurrentUser } = require("../utils/user");

// الحصول على جميع الفنادق
exports.getAllHotels = async (req, res, next) => {
  try {
    const result = await Hotel.getAll();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على فندق واحد بواسطة الكود
exports.getHotel = async (req, res, next) => {
  try {
    const result = await Hotel.findByCode(req.params.code);

    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// إنشاء فندق جديد
exports.createHotel = async (req, res, next) => {
  try {
    const { hotelName, address, website, email, tel, whatsUp, sts } = req.body;

    if (!hotelName || !address) {
      return res.status(400).json({
        success: false,
        error: "Hotel name and address are required",
      });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();

    // إنشاء كائن الفندق الجديد
    const newHotel = {
      hotelName,
      address,
      website,
      email,
      tel,
      whatsUp,
      sts: sts || 1,
    };

    // حفظ الفندق في قاعدة البيانات مع اسم المستخدم
    const result = await Hotel.create(newHotel, currentUser);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(201).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// تحديث فندق
exports.updateHotel = async (req, res, next) => {
  try {
    // التحقق من وجود الفندق
    const checkResult = await Hotel.findByCode(req.params.code);

    if (!checkResult.success) {
      return res.status(404).json({ success: false, error: "Hotel not found" });
    }

    const { hotelName, address, website, email, tel, whatsUp, sts } = req.body;

    if (!hotelName || !address) {
      return res.status(400).json({
        success: false,
        error: "Hotel name and address are required",
      });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();

    // إنشاء كائن التحديث
    const updateData = {
      hotelName,
      address,
      website,
      email,
      tel,
      whatsUp,
      sts,
    };

    // تحديث الفندق في قاعدة البيانات مع اسم المستخدم
    const result = await Hotel.update(req.params.code, updateData, currentUser);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// حذف فندق
exports.deleteHotel = async (req, res, next) => {
  try {
    // التحقق من وجود الفندق
    const checkResult = await Hotel.findByCode(req.params.code);

    if (!checkResult.success) {
      return res.status(404).json({ success: false, error: "Hotel not found" });
    }

    // حذف الفندق من قاعدة البيانات
    const result = await Hotel.delete(req.params.code);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// البحث عن فنادق
exports.searchHotels = async (req, res, next) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({
        success: false,
        error: "Search term is required",
      });
    }

    const result = await Hotel.search(term);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};
