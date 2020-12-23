const url = require('url');
const restaurantModel = require('../models/restaurant');
const fs = require('fs');
const formidable = require('formidable');
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;

// API
exports.getRestaurantByName = (req, res) => {
    const restaurantName = req.params.name;
    const doc = restaurantName ? {name: restaurantName} : restaurantName;
    getResult(doc, res);
}

exports.getRestaurantByBorough = (req, res) => {
    const restaurantBorough = req.params.borough;
    const doc = restaurantBorough ? {borough: restaurantBorough} : restaurantBorough;
    getResult(doc, res);
};

exports.getRestaurantByCuisine = (req, res) => {
    const restaurantCuisine = req.params.cuisine;
    const doc = restaurantCuisine ? {cuisine: restaurantCuisine} : restaurantCuisine;
    getResult(doc, res);
};

const getResult = (doc, res) => {
    restaurantModel.getRestaurant(doc, null, (docs) => {
        if (docs.length == 0) {
            res.status(500).json({});
        } else {
            res.status(200).json(docs);
        }
    });
}
// End of API

// need to Change
// not render with result
// result get from api
// add a textbox and button to 
// filter out restaurant which does not match the textbox
exports.getReadPage = (req, res) => {
    showRestaurantList(req, res, null, 'read');
};


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
exports.getNewPage = (req, res) => {
    res.render('new');
};

// page to show created document
// can redirect to rate, edit, remove, main page
// Read
// Display restaurant documents
//      • Show photo if it's available
//      • Show a link to Leaflet if coord is available
exports.processCreate = (req, res) => {
    createRestaurantObj(req, (restaurantObj) => {
        restaurantModel.createRestaurant(restaurantObj, (id) => {
            res.redirect(`/display?_id=${id}`);
        });
    });
}

const createRestaurantObj = (req, callback) => {
    const form = new formidable({multiples: true});
    form.parse(req, (err, fields, files) => {
        if (!fields.name) {
            showFailPage(res, 'Create', 'Restaurant name cannot be null');
        }
        const restaurantObj = new restaurantModel.Restaurant(
            fields.name,
            fields.borough,
            fields.cuisine,
            null,   //photo
            null,   //photoMimetype 
            fields.street,
            fields.building,
            fields.zipcode,
            fields.lat,
            fields.lon,
            [],   //grades
            req.session.userid
        );
        if (fields["_id"]) {
            restaurantObj["_id"] = fields["_id"];
        }
        if (files.sampleFile && files.sampleFile.size > 0) {
            fs.readFile(files.sampleFile.path, (err, data) => {
                assert.equal(err, null);
                restaurantObj.photo = new Buffer.from(data).toString('base64');
                restaurantObj.photoMimetype = files.sampleFile.type;

                callback(restaurantObj);
            });
        } else {
            callback(restaurantObj);
        }
    });
}

// page to show selected restaurant
// can redirect to rate, edit, remove, main page
//Display restaurant documents
//      • Show photo if it's available
//      • Show a link to Leaflet if coord is available
exports.getDisplayPage = (req, res) => {
    const parsedURL = url.parse(req.url, true);
    const id = parsedURL.query["_id"];
    const criteria = {'_id': ObjectID(id)};
    restaurantModel.getRestaurant(criteria, null, (docs) => {
        if (!docs.length) {
            showFailPage(res, "Display",
                "Restaurant maybe deleted"
            );
        } else {
            res.render('display', docs[0]);
        }
    })
    //show display view
};


exports.getMapPage = (req, res) => {
    const parsedURL = url.parse(req.url, true);
    const name = parsedURL.query.title;
    const lat = parsedURL.query.lat;
    const lon = parsedURL.query.lon;

    let mapObj = {
        name: name,
        lat: lat,
        lon: lon
    }

    res.render('map', mapObj);

}


// page to rate restaurant
// get method to get object id
// after rate redirect to display page (like /create page)
// Read+Update
// Rate restaurant. A restaurant can only be rated once by the same user.
//      • score > 0 and score <= 10
exports.getRatePage = (req, res) => {
    const parsedURL = url.parse(req.url, true);

    res.render('rate', {
        _id: parsedURL.query["_id"]
    });
};

// page to handle rating
exports.processRate = (req, res) => {
    const form = new formidable({multiples: true});
    const parsedURL = url.parse(req.url, true);
    const id = parsedURL.query["_id"];
    const objectID = {'_id': ObjectID(id)};
    const username = req.session.userid;

    //for loop compare username to objectID grades array user
    //if rating history has the same name
    //direct to views fail page
    //QUESTION: how to access grades.length and (rated username)user:score
    for (let i = 0; i < gradesLength; i++) {
        if (username == ratedUserName) {
            showFailPage(res, "Can not rate twice",
                "You have rated this restaurant before!"
            );
            break;
        }
    }

    form.parse(req, (err, fields, files) => {
        const score = fields.score;
        restaurantModel.updateRestaurant(
            objectID,
            {
                $push: {
                    grades: {
                        user: req.session.userid,
                        score: score
                    }
                }
            },
            (status) => {
                if (status) {
                    res.redirect(`/display?_id=${id}`);
                } else {
                    showFailPage(res, "Display",
                        "Restaurant maybe deleted"
                    );
                }
            });
    });
    //show display view
};

// page to edit restaurant document
// fill in with existing information
// Read+Update
// Update restaurant documents
//      • A document can only be updated by its owner (i.e. the user who created
//        the document)
exports.getChangePage = (req, res) => {
    const parsedURL = url.parse(req.url, true);
    const id = parsedURL.query["_id"];
    const criteria = {'_id': ObjectID(id)};
    restaurantModel.getRestaurant(criteria, {photo: 0, photoMimetype: 0}, (docs) => {
        if (!docs.length) {
            showFailPage(res, "Display",
                "Restaurant maybe deleted"
            );
        } else if (docs[0].owner != req.session.userid) {
            showFailPage(res, "Load edit page",
                `You are not the owner of restaurant ${docs[0].name}`
            );
        } else {
            res.render('edit', docs[0]);
        }
    })
};

// page to handle editing restaurant document
exports.processChange = (req, res) => {
    createRestaurantObj(req, (restaurantObj) => {
        const id = restaurantObj["_id"];
        const criteria = {'_id': ObjectID(id)};
        restaurantModel.updateRestaurant(criteria,
            {$set: restaurantObj}, (status) => {
                if (!status) {
                    showFailPage(res, "Edit",
                        "Restaurant maybe deleted"
                    );
                } else {
                    res.redirect(`/display?_id=${id}`);
                }
            });
    });
    // show display view
};

// handle delete restaurant first
// page to show remove status (Delete was successful or not)
// button redirect to home
// Remove
exports.getRemovePage = (req, res) => {
    const parsedURL = url.parse(req.url, true);
    const id = parsedURL.query["_id"];
    const criteria = {'_id': ObjectID(id)};
    const username = req.session.userid;
    restaurantModel.getRestaurant(criteria, {name: 1, owner: 1}, (docs) => {
        if (!docs.length) {
            showFailPage(res, "Delete",
                "Restaurant maybe deleted"
            );
        } else if (docs[0].owner != username) {
            showFailPage(res, "Delete",
                `You are not the owner of ${docs[0].name}`
            );
        } else {
            restaurantModel.remove(criteria, (status) => {
                if (!status) {
                    showFailPage(res, "Delete",
                        "Restaurant maybe deleted"
                    );
                } else {
                    res.render('remove');
                }
            });
        }
    })
};

const showFailPage = (res, action, errorMessage) => {
    res.status(500).render('fail', {
        action: action,
        errorMessage: errorMessage
    });
}

exports.getSearchPage = (req, res) => {
    res.render('search');
}

exports.getSearchResultPage = (req, res) => {
    const parsedURL = url.parse(req.url, true);
    const name = parsedURL.query["name"];
    const borough = parsedURL.query['borough'];
    const cuisine = parsedURL.query['cuisine'];

    const criteria = {};
    if (name || borough || cuisine) {
        criteria['$and'] = [];
    }
    if (name) {
        criteria['$and'].push({"name": {'$regex': new RegExp(name, "i")}});
    }
    if (borough) {
        criteria['$and'].push({"borough": {'$regex': new RegExp(borough, "i")}});
    }
    if (cuisine) {
        criteria['$and'].push({"cuisine": {'$regex': new RegExp(cuisine, "i")}});
    }

    showRestaurantList(req, res, criteria, 'searchresult');
}

const showRestaurantList = (req, res, criteria, page) => {
    restaurantModel.getRestaurant(criteria, {name: 1}, (docs) => {
        const result = {
            userid: req.session.userid,
            restaurants: docs
        };
        res.render(
            page,
            result
        );
    });
}