const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');

// Routes - Order matters! More specific routes first
router.post('/countries/refresh', countryController.refreshCountries.bind(countryController));
router.get('/countries/image', countryController.getSummaryImage.bind(countryController));
router.get('/countries/:name', countryController.getCountryByName.bind(countryController));
router.delete('/countries/:name', countryController.deleteCountry.bind(countryController));
router.get('/countries', countryController.getAllCountries.bind(countryController));
router.get('/status', countryController.getStatus.bind(countryController));

module.exports = router;