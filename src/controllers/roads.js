// src/controllers/roads.js
const Road = require("../models/road");
const { getCurrentUser, getCurrentDateTime } = require("../utils/user");

// الحصول على جميع الطرق
exports.getAllRoads = async (req, res, next) => {
  try {
    const result = await Road.getAll();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على طريق واحد بواسطة الكود
exports.getRoad = async (req, res, next) => {
  try {
    const cityCode = parseInt(req.params.cityCode);
    const roadCode = parseInt(req.params.roadCode);

    if (isNaN(cityCode) || isNaN(roadCode)) {
      return res.status(400).json({
        success: false,
        error: "City code and road code must be valid numbers",
      });
    }

    const result = await Road.findByCode(cityCode, roadCode);

    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على الطرق حسب المدينة
exports.getRoadsByCity = async (req, res, next) => {
  try {
    const cityCode = parseInt(req.params.cityCode);

    if (isNaN(cityCode)) {
      return res.status(400).json({
        success: false,
        error: "City code must be a valid number",
      });
    }

    const result = await Road.findByCity(cityCode);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// إنشاء طريق جديد
exports.createRoad = async (req, res, next) => {
  try {
    const { cityCode, roadCode, transType, roadName } = req.body;

    if (!cityCode || !roadCode || !roadName) {
      return res.status(400).json({
        success: false,
        error: "City code, road code and road name are required",
      });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();
    const currentDateTime = getCurrentDateTime();

    // إنشاء كائن الطريق الجديد
    const newRoad = {
      cityCode,
      roadCode,
      transType,
      roadName,
    };

    // حفظ الطريق في قاعدة البيانات مع اسم المستخدم
    const result = await Road.create(newRoad, currentUser);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    console.log(`Road created by ${currentUser} on ${currentDateTime}`);
    res.status(201).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// تحديث طريق
exports.updateRoad = async (req, res, next) => {
  try {
    const cityCode = parseInt(req.params.cityCode);
    const roadCode = parseInt(req.params.roadCode);

    if (isNaN(cityCode) || isNaN(roadCode)) {
      return res.status(400).json({
        success: false,
        error: "City code and road code must be valid numbers",
      });
    }

    const { transType, roadName } = req.body;

    if (!roadName) {
      return res.status(400).json({
        success: false,
        error: "Road name is required",
      });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();
    const currentDateTime = getCurrentDateTime();

    // إنشاء كائن التحديث
    const updateData = {
      transType,
      roadName,
    };

    // تحديث الطريق في قاعدة البيانات مع اسم المستخدم
    const result = await Road.update(
      cityCode,
      roadCode,
      updateData,
      currentUser
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    console.log(`Road updated by ${currentUser} on ${currentDateTime}`);
    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// حذف طريق
exports.deleteRoad = async (req, res, next) => {
  try {
    const cityCode = parseInt(req.params.cityCode);
    const roadCode = parseInt(req.params.roadCode);

    if (isNaN(cityCode) || isNaN(roadCode)) {
      return res.status(400).json({
        success: false,
        error: "City code and road code must be valid numbers",
      });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();
    const currentDateTime = getCurrentDateTime();

    // حذف الطريق من قاعدة البيانات
    const result = await Road.delete(cityCode, roadCode);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    console.log(`Road deleted by ${currentUser} on ${currentDateTime}`);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// البحث عن طرق
exports.searchRoads = async (req, res, next) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({
        success: false,
        error: "Search term is required",
      });
    }

    const result = await Road.search(term);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};
