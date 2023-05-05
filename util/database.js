const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;
exports.mongoConnect = (cb) => {
    MongoClient.connect('mongodb+srv://sevy:qZObkw3wGQWyx0bG@cluster0.ywdfl65.mongodb.net/tutor-business').then((client) => {
        _db = client.db();
        console.log('Connected');
        cb();
    }).catch((err) => {
        console.log(err);
    });
}

exports.getDb = () => {
    if (_db) {
        return _db;
    }
}