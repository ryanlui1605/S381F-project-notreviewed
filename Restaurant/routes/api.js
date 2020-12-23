const express = require('express');

const restaurantController = require('../controllers/restaurant');

const router = express.Router();


// "?" for optional params
router.get('/restaurant/name/:name?', restaurantController.getRestaurantByName);

router.get('/restaurant/borough/:borough?', restaurantController.getRestaurantByBorough);

router.get('/restaurant/cuisine/:cuisine?', restaurantController.getRestaurantByCuisine);

module.exports = router;