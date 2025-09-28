// src/routes/invhdrs.js
const express = require("express");
const router = express.Router();

const {
  getAllInvHdrs,
  getInvHdr,
  getInvHdrsByCustomer,
  getInvHdrsByDate,
  getInvHdrsByDateRange,
  getInvHdrsByPeriod,
  getInvHdrsByDateRangeGrouped,
  createInvHdr,
  updateInvHdr,
  deleteInvHdr,
} = require("../controllers/invhdrs");

// @desc    الحصول على جميع الفواتير
// @route   GET /api/invhdrs
// @access  Public
router.get("/", getAllInvHdrs);

// @desc    الحصول على الفواتير بفترة زمنية (من تاريخ إلى تاريخ)
// @route   GET /api/invhdrs/range?fromDate=2025-01-01&toDate=2025-12-31
// @access  Public
router.get("/range", getInvHdrsByDateRange);

// @desc    الحصول على فاتورة واحدة بواسطة رقم الفاتورة
// @route   GET /api/invhdrs/:invNo
// @access  Public
router.get("/:invNo", getInvHdr);

// @desc    الحصول على الفواتير بواسطة كود العميل
// @route   GET /api/invhdrs/customer/:customerCode
// @access  Public
router.get("/customer/:customerCode", getInvHdrsByCustomer);

// @desc    الحصول على الفواتير بواسطة تاريخ الحركة
// @route   POST /api/invhdrs/date
// @access  Public
router.post("/date", getInvHdrsByDate);

// @desc    الحصول على الفواتير التي تشمل فترتها التاريخ المحدد
// @route   POST /api/invhdrs/period
// @access  Public
router.post("/period", getInvHdrsByPeriod);

// @desc    الحصول على الفواتير مجمعة حسب BoatCode في فترة زمنية
// @route   POST /api/invhdrs/grouped
// @access  Public
router.post("/grouped", getInvHdrsByDateRangeGrouped);

// @desc    إنشاء فاتورة جديدة
// @route   POST /api/invhdrs
// @access  Public
router.post("/", createInvHdr);

// @desc    تحديث فاتورة موجودة
// @route   PUT /api/invhdrs/:invNo
// @access  Public
router.put("/:invNo", updateInvHdr);

// @desc    حذف فاتورة
// @route   DELETE /api/invhdrs/:invNo
// @access  Public
router.delete("/:invNo", deleteInvHdr);

module.exports = router;
