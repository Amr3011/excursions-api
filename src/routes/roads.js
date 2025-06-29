// src/routes/roads.js
const express = require("express");
const router = express.Router();
const roadsController = require("../controllers/roads");

// مسارات الطرق
router.get("/", roadsController.getAllRoads);
router.get("/search", roadsController.searchRoads);
router.get("/city/:cityCode", roadsController.getRoadsByCity);
router.get("/:cityCode/:roadCode", roadsController.getRoad);
router.post("/", roadsController.createRoad);
router.put("/:cityCode/:roadCode", roadsController.updateRoad);
router.delete("/:cityCode/:roadCode", roadsController.deleteRoad);

module.exports = router;
