const MongoClient = require("mongodb").MongoClient;
const assert = require('assert');

const mongourl = 'mongodb+srv://s1260229:12602296@cluster0.yku7r.mongodb.net/s381fProject?retryWrites=true&w=majority';
const dbName = 's381fProject';
const client = new MongoClient(mongourl);

let _db;

//always only have one _db instance for handle mongodb query
const mongodbConnect = (callback) => {
    client.connect((err) => {
        assert.equal(null, err);
        _db = client.db(dbName);
        callback();
    })
}

const getDb = () => {
    return _db;
}

exports.mongodbConnect = mongodbConnect;
exports.getDb = getDb;