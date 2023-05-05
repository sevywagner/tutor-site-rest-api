const router = require('express').Router();
const notesController = require('./../controllers/notes');
const isAuth = require('./../middleware/is-auth');

router.put('/upload', isAuth, notesController.putUpload);
router.get('/get-users-notes', isAuth, notesController.getUsersNotes);
router.post('/get-note-file', notesController.postNoteFileDownload);

module.exports = router;