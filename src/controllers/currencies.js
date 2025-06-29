// src/controllers/currencies.js
const Currency = require("../models/currency");
const { getCurrentUser, getCurrentDateTime } = require("../utils/user");

// الحصول على جميع العملات
exports.getAllCurrencies = async (req, res, next) => {
  try {
    const result = await Currency.getAll();

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// الحصول على عملة واحدة بواسطة الكود
exports.getCurrency = async (req, res, next) => {
  try {
    const currencyCode = req.params.code;

    if (!currencyCode) {
      return res.status(400).json({
        success: false,
        error: "Currency code is required",
      });
    }

    const result = await Currency.findByCode(currencyCode);

    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// إنشاء عملة جديدة
exports.createCurrency = async (req, res, next) => {
  try {
    const { currencyCode, currencyCode2, currencyName } = req.body;

    if (!currencyCode || !currencyName) {
      return res.status(400).json({
        success: false,
        error: "Currency code and name are required",
      });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();
    const currentDateTime = getCurrentDateTime();

    // إنشاء كائن العملة الجديدة
    const newCurrency = {
      currencyCode,
      currencyCode2,
      currencyName,
    };

    // حفظ العملة في قاعدة البيانات مع اسم المستخدم
    const result = await Currency.create(newCurrency, currentUser);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    console.log(`Currency created by ${currentUser} on ${currentDateTime}`);
    res.status(201).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// تحديث عملة
exports.updateCurrency = async (req, res, next) => {
  try {
    const currencyCode = req.params.code;

    if (!currencyCode) {
      return res.status(400).json({
        success: false,
        error: "Currency code is required",
      });
    }

    const { currencyCode2, currencyName } = req.body;

    if (!currencyName) {
      return res.status(400).json({
        success: false,
        error: "Currency name is required",
      });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();
    const currentDateTime = getCurrentDateTime();

    // إنشاء كائن التحديث
    const updateData = {
      currencyCode2,
      currencyName,
    };

    // تحديث العملة في قاعدة البيانات مع اسم المستخدم
    const result = await Currency.update(currencyCode, updateData, currentUser);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    console.log(`Currency updated by ${currentUser} on ${currentDateTime}`);
    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

// حذف عملة
exports.deleteCurrency = async (req, res, next) => {
  try {
    const currencyCode = req.params.code;

    if (!currencyCode) {
      return res.status(400).json({
        success: false,
        error: "Currency code is required",
      });
    }

    // الحصول على اسم المستخدم الحالي
    const currentUser = getCurrentUser();
    const currentDateTime = getCurrentDateTime();

    // حذف العملة من قاعدة البيانات
    const result = await Currency.delete(currencyCode);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    console.log(`Currency deleted by ${currentUser} on ${currentDateTime}`);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// البحث عن عملات
exports.searchCurrencies = async (req, res, next) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({
        success: false,
        error: "Search term is required",
      });
    }

    const result = await Currency.search(term);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};
