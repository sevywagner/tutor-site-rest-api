const getDb = require('./../util/database').getDb;
const mongo = require('mongodb');

class Note {
    constructor(filename, driveId, userId) {
        this.filename = filename;
        this.driveId = driveId;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        return db.collection('notes').insertOne(this);
    }

    static fetchUserNotes(userId) {
        const db = getDb();
        return db.collection('notes').find({ userId: new mongo.ObjectId(userId) }).toArray();
    }

    static findById(noteId) {
        const db = getDb();
        return db.collection('notes').findOne({ _id: new mongo.ObjectId(noteId) });
    }
}

module.exports = Note;