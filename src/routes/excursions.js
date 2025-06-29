// src/routes/excursions.js
const express = require("express");
const router = express.Router();
const excursionsController = require("../controllers/excursions");

// مسارات الرحلات
router.get("/", excursionsController.getAllExcursions);
router.get("/search", excursionsController.searchExcursions);
router.get("/hotels", excursionsController.getHotels);
router.get("/nationalities", excursionsController.getNationalities);
router.get("/currencies", excursionsController.getCurrencies);
router.get("/excursion-types", excursionsController.getExcursionTypes);
router.get("/customers", excursionsController.getCustomers);
router.get("/next-voucher-no", excursionsController.getNextVoucherNo);
router.get("/:voucherNo", excursionsController.getExcursion);
router.post("/", excursionsController.createExcursion);
router.put("/:voucherNo", excursionsController.updateExcursion);
router.delete("/:voucherNo", excursionsController.deleteExcursion);

module.exports = router;
