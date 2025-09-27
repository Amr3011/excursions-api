// src/routes/invhdrs.js
const express = require("express");
const router = express.Router();

const {
  getAllInvHdrs,
  getInvHdr,
  getInvHdrsByCustomer,
  getInvHdrsByDate,
  createInvHdr,
  updateInvHdr,
  deleteInvHdr,
} = require("../controllers/invhdrs");

// @desc    الحصول على جميع الفواتير
// @route   GET /api/invhdrs
// @access  Public
router.get("/", getAllInvHdrs);

// @desc    الحصول على فاتورة واحدة بواسطة رقم الفاتورة
// @route   GET /api/invhdrs/:invNo
// @access  Public
router.get("/:invNo", getInvHdr);

// @desc    الحصول على الفواتير بواسطة كود العميل
// @route   GET /api/invhdrs/customer/:customerCode
// @access  Public
router.get("/customer/:customerCode", getInvHdrsByCustomer);

// @desc    الحصول على الفواتير بواسطة تاريخ الحركة
// @route   GET /api/invhdrs/date/:date
// @access  Public
router.get("/date/:date", getInvHdrsByDate);

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
