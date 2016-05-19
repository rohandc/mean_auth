"use strict";
/*
 -Authors:
 -Date:
 -Purpose:

 @param
 @
 */
// dependencies
var express = require('express'),
    app = express(),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    busboy = require('busboy-body-parser'),
    expressSession = require('express-session'),
    hash = require('bcrypt-nodejs'),
    path = require('path'),
    fs = require('fs'),
    passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose'),
    multer = require('multer'),
    storage = require('gridfs-storage-engine')(
        {
            database: 'mean-auth',
            collection: 'apartments'

        }
    ),
    MongoStore = require('connect-mongo')(expressSession),
    custom = require('./Custom.js');
custom = new custom();
custom.initializeMongoose(function (res) {
});


//Multer test
var handler = multer({
    // dest: '/client/partials/images/uploads/',
    //storage: storage,
    limits: {
        fileSize: 500000
    },
    rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
    }
    /*  ,
     onFileSizeLimit: function (file) {
     fileTooLarge = true;
     res.json({
     uploadError: 'Upload failed. File must be less than 500 KB'
     });
     },
     onFileUploadStart: function (file) {
     console.log(file.originalname + ' is starting ...');
     },
     onFileUploadComplete: function (file, req, res) {
     console.log(file.fieldname + ' uploaded to  ' + file.path);
     var newFileName = req.files.file[0].name;
     if(!fileTooLarge) {
     articles.uploadUserImage(req, res, newFileName, function() {
     file.path = 'http://<myblobstorage>.blob.core.windows.net/userpictures/' + newFileName;
     //file param is actually an object with the path as a property
     res.send(file);
     //delete file from local uploads folder
     fs.unlink('../client/partials/images/uploads/' + newFileName);
     });
     } else {
     fs.unlink('../client/partials/images/uploads/' + newFileName);
     }
     }*/
});
//app.use(handler.any('image'));

// user schema/model
var User = require('./models/user.js');
var Admin = require('./models/admin.js');
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../client/partials/')));
//Provide Access to Directories else 404 error
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})
app.use(logger('combined', {stream: accessLogStream}));
app.use(cookieParser());
app.use(busboy({limits: {fileSize: 10 * 1024 * 1024}}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
// configure passport for User

passport.use("user", new localStrategy(function (username, password, done) {
    User.findOne({username: username}, function (err, user) {
        if (!err && user && User.authenticate(password)) {
            return done(null, user);
        }

    });
}));
passport.use("admin", new localStrategy(function (username, password, done) {
    Admin.findOne({username: username}, function (err, user) {

        if (!err && user && Admin.authenticate(password)) {
            return done(null, user);
        }

    });
}));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());


// routes middleware note place middleware before  route handler 
// else middleware will not get executed if placed after a route
// require routes
var routes = require('./routes/api.js');
app.use('/user/', routes);
//end of middleware
//Start of Route handler
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});
// error handlers
app.use(function (req, res, next) {
    var err = new Error(req.url + 'Not Found');
    err.status = 404;
    next(err);
});
app.use(function (err, req, res) {
    res.status(err.status || 500);
    console.log(err);
    res.render(JSON.stringify({//res.stringify
        message: err.message,
        error: {}
    }));
});


module.exports = app;
