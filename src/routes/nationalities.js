// src/routes/nationalities.js
const express = require("express");
const router = express.Router();
const nationalitiesController = require("../controllers/nationalities");

// مسارات الجنسيات
router.get("/", nationalitiesController.getAllNationalities);
router.get("/search", nationalitiesController.searchNationalities);
router.get("/:code", nationalitiesController.getNationality);
router.post("/", nationalitiesController.createNationality);
router.put("/:code", nationalitiesController.updateNationality);
router.delete("/:code", nationalitiesController.deleteNationality);

module.exports = router;
