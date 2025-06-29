// src/routes/currencies.js
const express = require("express");
const router = express.Router();
const currenciesController = require("../controllers/currencies");

// مسارات العملات
router.get("/", currenciesController.getAllCurrencies);
router.get("/search", currenciesController.searchCurrencies);
router.get("/:code", currenciesController.getCurrency);
router.post("/", currenciesController.createCurrency);
router.put("/:code", currenciesController.updateCurrency);
router.delete("/:code", currenciesController.deleteCurrency);

module.exports = router;
