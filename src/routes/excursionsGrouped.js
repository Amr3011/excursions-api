// src/routes/excursionsGrouped.js
const express = require("express");
const router = express.Router();

const {
  getAllExcursions,
  getExcursionsByHotel,
  getExcursionsByDate,
  getExcursionsByDateRange,
  getExcursionsByPeriod,
  getExcursionsByDateRangeGrouped,
  createExcursion,
  updateExcursion,
  deleteExcursion,
} = require("../controllers/excursionsGrouped");

// @desc    الحصول على جميع السجلات
// @route   GET /api/excursionsGrouped
// @access  Public
router.get("/", getAllExcursions);

// @desc    الحصول على السجلات بفترة زمنية (من تاريخ إلى تاريخ)
// @route   GET /api/excursionsGrouped/range?fromDate=2025-01-01&toDate=2025-12-31
// @access  Public
router.get("/range", getExcursionsByDateRange);

// @desc    الحصول على السجلات بواسطة كود الفندق
// @route   GET /api/excursionsGrouped/hotel/:hotelCode
// @access  Public
router.get("/hotel/:hotelCode", getExcursionsByHotel);

// @desc    الحصول على السجلات بواسطة تاريخ الفاوتشر
// @route   POST /api/excursionsGrouped/date
// @access  Public
router.post("/date", getExcursionsByDate);

// @desc    الحصول على السجلات التي تشمل فترتها التاريخ المحدد
// @route   POST /api/excursionsGrouped/period
// @access  Public
router.post("/period", getExcursionsByPeriod);

// @desc    الحصول على السجلات مجمعة حسب HotelCode في فترة زمنية
// @route   POST /api/excursionsGrouped/grouped
// @access  Public
router.post("/grouped", getExcursionsByDateRangeGrouped);

// @desc    إنشاء سجل جديد
// @route   POST /api/excursionsGrouped
// @access  Public
router.post("/", createExcursion);

// @desc    تحديث سجل موجود
// @route   PUT /api/excursionsGrouped/:id
// @access  Public
router.put("/:id", updateExcursion);

// @desc    حذف سجل
// @route   DELETE /api/excursionsGrouped/:id
// @access  Public
router.delete("/:id", deleteExcursion);

module.exports = router;
