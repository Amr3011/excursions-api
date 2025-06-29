// src/routes/hotels.js
const express = require("express");
const router = express.Router();
const hotelsController = require("../controllers/hotels");

// مسارات الفنادق
router.get("/", hotelsController.getAllHotels);
router.get("/search", hotelsController.searchHotels);
router.get("/:code", hotelsController.getHotel);
router.post("/", hotelsController.createHotel);
router.put("/:code", hotelsController.updateHotel);
router.delete("/:code", hotelsController.deleteHotel);

module.exports = router;
