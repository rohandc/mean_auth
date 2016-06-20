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
    MongoStore = require('connect-mongo')(expressSession),
    routes = require('./routes/api.js');
var custom = require('./Custom.js');
custom = new custom();
custom.initializeMongoose(function (res) {
});


//Multer test
/*
 var multer = require('multer'),
 storage = require('gridfs-storage-engine')(
 {
 database: 'mean-auth',
 collection: 'apartments'

 }
 ),
 var handler = multer.diskStorage({
 dest: '/client/partials/images/uploads/',
 //storage: storage,
 limits: {
 fileSize: 500000
 },
 rename: function (fieldname, filename) {
 return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
 }

 }).any('image');
 app.use(handler);
 */


app.use(routes.upload);

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
    console.log(err.message);
    console.log(err.stack);
    res.render(JSON.stringify({//res.stringify
        message: err.message,
        error: {}
    }));
});


module.exports = app;
