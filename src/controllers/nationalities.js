// src/controllers/nationalities.js
const Nationality = require("../models/nationality");
const { getCurrentUser, getCurrentDateTime } = require("../utils/user");

// الحصول على جميع الجنسيات
exports.getAllNationalities = async (req, res, next) => {
  try {
    const result = await Nationality.getAll();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على جنسية واحدة بواسطة الكود
exports.getNationality = async (req, res, next) => {
  try {
    const result = await Nationality.findByCode(req.params.code);

    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// إنشاء جنسية جديدة
exports.createNationality = async (req, res, next) => {
  try {
    const { nationalityName, account } = req.body;

    if (!nationalityName) {
      return res.status(400).json({
        success: false,
        error: "Nationality name is required",
      });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();
    const currentDateTime = getCurrentDateTime();

    // إنشاء كائن الجنسية الجديدة
    const newNationality = {
      nationalityName,
      account,
    };

    // حفظ الجنسية في قاعدة البيانات مع اسم المستخدم
    const result = await Nationality.create(newNationality, currentUser);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    console.log(`Nationality created by ${currentUser} on ${currentDateTime}`);
    res.status(201).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// تحديث جنسية
exports.updateNationality = async (req, res, next) => {
  try {
    // التحقق من وجود الجنسية
    const checkResult = await Nationality.findByCode(req.params.code);

    if (!checkResult.success) {
      return res
        .status(404)
        .json({ success: false, error: "Nationality not found" });
    }

    const { nationalityName, account } = req.body;

    if (!nationalityName) {
      return res.status(400).json({
        success: false,
        error: "Nationality name is required",
      });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();
    const currentDateTime = getCurrentDateTime();

    // إنشاء كائن التحديث
    const updateData = {
      nationalityName,
      account,
    };

    // تحديث الجنسية في قاعدة البيانات مع اسم المستخدم
    const result = await Nationality.update(
      req.params.code,
      updateData,
      currentUser
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    console.log(`Nationality updated by ${currentUser} on ${currentDateTime}`);
    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// حذف جنسية
exports.deleteNationality = async (req, res, next) => {
  try {
    // التحقق من وجود الجنسية
    const checkResult = await Nationality.findByCode(req.params.code);

    if (!checkResult.success) {
      return res
        .status(404)
        .json({ success: false, error: "Nationality not found" });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();
    const currentDateTime = getCurrentDateTime();

    // حذف الجنسية من قاعدة البيانات
    const result = await Nationality.delete(req.params.code);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    console.log(`Nationality deleted by ${currentUser} on ${currentDateTime}`);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// البحث عن جنسيات
exports.searchNationalities = async (req, res, next) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({
        success: false,
        error: "Search term is required",
      });
    }

    const result = await Nationality.search(term);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};
