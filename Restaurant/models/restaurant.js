const assert = require('assert');
const getDb = require("../utils/db").getDb;

exports.getRestaurant = (criteria, filter = {}, callback) => {
    const db = getDb();
    let cursor = db.collection('restaurants').find(
        criteria,
        filter
    );
    cursor.toArray((err, docs) => {
        assert.equal(err, null);
        callback(docs); //array
    });
}

class Address {
    constructor(
        street,
        building,
        zipcode,
        lat,
        lon
    ) {
        this.street = street;
        this.building = building;
        this.zipcode = zipcode;
        this.coord = [lat, lon];
    }
}

class Grades {
    constructor(
        user,
        score
    ) {
        this.user = user;
        this.score = score;
    }
}

class Restaurant {
    constructor(name, borough = '', cuisine = '', photo = '', photoMimetype = '', street = '',
        building = '', zipcode = '', lat = '', lon = '', grades = [], owner) {
        this.name = name;
        this.borough = borough;
        this.cuisine = cuisine;
        this.photo = photo;
        this.photoMimetype = photoMimetype;
        this.address = new Address(street, building, zipcode, lat, lon);
        this.grades = grades;
        this.owner = owner;
    }
}

exports.createRestaurant = (restaurant, callback) => {
    //insert into mongodb
    const db = getDb();
    db.collection('restaurants').insertOne(restaurant, (err, docs) => {
        //get restaurant_id created by mongodb
        restaurant_id = docs.ops[0]._id;
        callback(restaurant_id);
    });
}
// Create
// handle result in callback

// Update
exports.updateRestaurant = (id, action, callback) => {
    const db = getDb();
    if (action["$set"]) {
        if (!action["$set"].photo) {
            delete action["$set"].photo;
            delete action["$set"].photoMimetype;
        }
        delete action["$set"].grades;
        delete action["$set"]["_id"];
    }
    db.collection('restaurants').updateOne(
        id,
        action,
        (err, result) => {
            assert.equal(err, null);
            callback(!!result.matchedCount);
        }
    );
}

// Delete
// only requst on restaurant
exports.remove = (id, callback) => {
    const db = getDb();
    db.collection('restaurants').deleteOne(
        id,
        (err, obj)=>{
            assert.equal(err, null);
            callback(obj.deletedCount);
        }
    )
}


// end of function for CRUD

exports.Restaurant = Restaurant;