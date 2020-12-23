const express = require('express');

const restaurantController= require('../controllers/restaurant');

const router = express.Router();

// page to show 
// user name
// number of document
// button redirect to create new document
// list of restaurant name with link

// Read
router.get('/read', restaurantController.getReadPage);

// page to implement search function
// Search
//      • by name, borough, cuisine or borough.
router.get('/search', restaurantController.getSearchPage);

router.get('/searchresult', restaurantController.getSearchResultPage)

// page to create new restaurant document
// redirect to create page by post method after click create
// Create
// Create new restaurant documents
//     • Restaurant documents may contain the following attributes:
//      i. restaurant_id
//      ii. name
//      iii. borough
//      iv. cuisine
//      v. photo
//      vi. photo mimetype
//      vii. address
//          1. street
//          2. building
//          3. zipcode
//          4. coord
//      viii. grades
//          1. user
//          2. score
//      ix. owner
// • name and owner are mandatory; other attributes are optional
router.get('/new', restaurantController.getNewPage);

// page to show created document
// can redirect to rate, edit, remove, main page
// Read
// Display restaurant documents
//      • Show photo if it's available
//      • Show a link to Leaflet if coord is available
router.post('/create', restaurantController.processCreate);

// page to show selected restaurant
// can redirect to rate, edit, remove, main page
//Display restaurant documents
//      • Show photo if it's available
//      • Show a link to Leaflet if coord is available
router.get('/display', restaurantController.getDisplayPage);

// page to rate restaurant
// get method to get object id
// after rate redirect to display page (like /create page)
// Read+Update
// Rate restaurant. A restaurant can only be rated once by the same user.
//      • score > 0 and score <= 10
router.get('/rate', restaurantController.getRatePage);

// page to handle rating
router.post('/rate', restaurantController.processRate);

// page to edit restaurant document
// fill in with existing information
// Read+Update
// Update restaurant documents
//      • A document can only be updated by its owner (i.e. the user who created
//        the document)
router.get('/change', restaurantController.getChangePage);

// page to handle editing restaurant document
router.post('/change', restaurantController.processChange);

// page to show remove status (Delete was successful)
// button redirect to home
// Remove
router.get('/remove', restaurantController.getRemovePage);

router.get('/gmap',restaurantController.getMapPage);


module.exports = router;