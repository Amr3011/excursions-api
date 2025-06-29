// src/controllers/cities.js
const City = require("../models/city");
const { getCurrentUser } = require("../utils/user");

// الحصول على جميع المدن
exports.getAllCities = async (req, res, next) => {
  try {
    const result = await City.getAll();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على مدينة واحدة بواسطة الكود
exports.getCity = async (req, res, next) => {
  try {
    const result = await City.findByCode(req.params.code);

    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// إنشاء مدينة جديدة
exports.createCity = async (req, res, next) => {
  try {
    const { cityName } = req.body;

    if (!cityName) {
      return res.status(400).json({
        success: false,
        error: "City name is required",
      });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();

    // إنشاء كائن المدينة الجديدة
    const newCity = {
      cityName,
    };

    // حفظ المدينة في قاعدة البيانات مع اسم المستخدم
    const result = await City.create(newCity, currentUser);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(201).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// تحديث مدينة
exports.updateCity = async (req, res, next) => {
  try {
    // التحقق من وجود المدينة
    const checkResult = await City.findByCode(req.params.code);

    if (!checkResult.success) {
      return res.status(404).json({ success: false, error: "City not found" });
    }

    const { cityName } = req.body;

    if (!cityName) {
      return res.status(400).json({
        success: false,
        error: "City name is required",
      });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();

    // إنشاء كائن التحديث
    const updateData = {
      cityName,
    };

    // تحديث المدينة في قاعدة البيانات مع اسم المستخدم
    const result = await City.update(req.params.code, updateData, currentUser);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// حذف مدينة
exports.deleteCity = async (req, res, next) => {
  try {
    // التحقق من وجود المدينة
    const checkResult = await City.findByCode(req.params.code);

    if (!checkResult.success) {
      return res.status(404).json({ success: false, error: "City not found" });
    }

    // حذف المدينة من قاعدة البيانات
    const result = await City.delete(req.params.code);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// البحث عن مدن
exports.searchCities = async (req, res, next) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({
        success: false,
        error: "Search term is required",
      });
    }

    const result = await City.search(term);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};
