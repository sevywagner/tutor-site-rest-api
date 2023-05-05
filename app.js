const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoConnect = require('./util/database').mongoConnect;
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.json());

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'notes/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

app.use(multer({ storage: diskStorage }).single('file'));

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/admin', adminRoutes);

app.use((error, req, res, next) => {
    res.status(error.statusCode).json({
        error: error.message
    });
});

mongoConnect(() => {
    app.listen(8080);
});