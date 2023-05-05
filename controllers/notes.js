const Note = require('./../models/Note');
const fs = require('fs');
const { google } = require('googleapis');
const mongo = require('mongodb');

const oath2client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);
oath2client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
const drive = google.drive({
    version: 'v3',
    auth: oath2client
});

exports.putUpload = (req, res, next) => {
    const file = req.file;
    const name = req.body.name;
    const id = req.body.userId;
    const mimeTypeExtension = req.body.mimeType;

    if (!req.isAdmin) {
        const error = new Error('You are not authorized to upload files');
        error.statusCode = 401;
        throw error;
    }

    const uploadFile = async () => {
        try {
            const response = await drive.files.create({
                requestBody: {
                    name: name,
                    mimeType: 'application/pdf',
        
                },
                media: {
                    mimeType: 'application/pdf',
                    body: fs.createReadStream(file.path)
                }
            });

            const note = new Note(file.path.split('/')[1], response.data.id, new mongo.ObjectId(id));
    
            note.save().then(() => {
                fs.unlink(file.path, (err) => {
                    if (err) {
                        err.statusCode = 500;
                        throw err;
                    }
        
                    res.status(201).json({
                        message: 'Successfully uploaded to drive and added to mongo'
                    });
                })
            }).catch((err) => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            });
        } catch(err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        }
    }

    uploadFile();
}

exports.getUsersNotes = (req, res, next) => {
    Note.fetchUserNotes(req.userId).then((notes) => {
        if (!notes) {
            const error = new Error('error fetching notes');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            notesList: notes
        });

    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.postNoteFileDownload = (req, res, next) => {
    const noteId = req.body.noteId;
    console.log(noteId);

    drive.files.get({
        fileId: noteId,
        mimeType: 'application/pdf',
        fields: 'webContentLink'
    }, (err, response) => {
        if (err) {
            err.statusCode = 500;
            throw err;
        }
        // console.log(response.data);
        res.status(200).send(response.data);
    });
}