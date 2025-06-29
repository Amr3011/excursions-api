// src/routes/cities.js
const express = require('express');
const router = express.Router();
const citiesController = require('../controllers/cities');

// مسارات المدن
router.get('/', citiesController.getAllCities);
router.get('/search', citiesController.searchCities);
router.get('/:code', citiesController.getCity);
router.post('/', citiesController.createCity);
router.put('/:code', citiesController.updateCity);
router.delete('/:code', citiesController.deleteCity);

module.exports = router;