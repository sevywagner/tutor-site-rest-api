const getDb = require('./../util/database').getDb;
const mongo = require('mongodb');

class User {
    constructor(name, username, email, password, resetToken, resetTokenExpiration, id) {
        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;
        this.resetToken = resetToken || null;
        this.resetTokenExpiration = resetTokenExpiration || null;
        this._id = id || null;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    updateResetToken() {
        const db = getDb();
        return db.collection('users').updateOne({ _id: new mongo.ObjectId(this._id) }, { $set: { 
            resetToken: this.resetToken, 
            resetTokenExpiration: this.resetTokenExpiration,
        }});
    }

    resetPassword() {
        const db = getDb();
        return db.collection('users').updateOne({ _id: new mongo.ObjectId(this._id) }, { $set: { password: this.password } });
    }

    static fetchAllUsers() {
        const db = getDb();
        return db.collection('users').find().toArray();
    }

    static findByEmail(email) {
        const db = getDb();
        return db.collection('users').findOne({ email: email });
    }

    static findByUsername(username) {
        const db = getDb();
        return db.collection('users').findOne({ username: username });
    }

    static findByToken(token) {
        const db = getDb();
        return db.collection('users').findOne({ resetToken: token });
    }
}

module.exports = User;