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
    FacebookStrategy = require('passport-facebook').Strategy,
//   raphael         = require('node-raphael'),
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

//    mongoose.connect('mongodb://localhost/mean-auth');


var app = express();

//Multer test
var handler = multer({
    dest: '../client/partials/images/uploads/',
    storage: storage,
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

app.use(handler.any('image'));

// user schema/model
var User = require('./models/user.js');
var Admin = require('./models/admin.js');

/*
 app.use('/',function (req, res, next) {
 // req.path will be the req.url with the /users prefix stripped
 console.log("Inside APP_JS Logger: "+req.path );
 next();
 });
 */

// define middleware
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../client/partials/')));
//Provide Access to Directories else 404 error
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})
app.use(logger('combined', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(busboy({limits: {fileSize: 10 * 1024 * 1024}}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
//Maintaining Session using Mongoose Store
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

passport.use("user",new localStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
        if (!err && user && User.authenticate(password)) {
            return done(null, user);
        }

    });
}));


passport.use("admin",new localStrategy(function(username, password, done) {
    Admin.findOne({ username: username }, function(err, user) {

        if (!err && user && Admin.authenticate(password)) {
            return done(null, user);
        }

    });
}));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());


/*
passport.use('local',new localStrategy(function(username, password, done) {
   User.findOne({ username : username }, function(err, user) {
        // first method succeeded?
        debugger;
        if (!err && user && user.authenticate(password)) {
             done(null, user);
        }

        // no, try second method:
        Admin.findOne({username:username }, function(err, user) {
            // second method succeeded?
            debugger;
            if (! err && user && user.authenticate(password)) {
                done(null, user);
            }
            // fail!
     done(new Error('invalid user or password'));
        });
    });

}));

passport.serializeUser(function(modelname,user,done) {
    debugger;
    if (modelname=="User")
    {
        passport.serializeUser(User.serializeUser());
        done(null,user);

    } else if (modelname=="Admin")
    {
        passport.serializeUser(Admin.serializeUser());
        done(null,user);
    }
});


passport.deserializeUser(function(modelname,user,done) {
    if (modelname=="User")
    {
        passport.deserializeUser(User.deserializeUser());
        done(null,user);

    } else if (modelname=="Admin")
    {
        passport.deserializeUser(Admin.deserializeUser());
        done(null,user);
    }
});*/

/*
passport.use(new localStrategy('local',User.authenticate()));
passport.deserializeUser(User.deserializeUser());
configure passport for Admin
var authStrategy = new AdminlocalStrategy('admin', {
    usernameField: 'admin_username',
    passwordField: 'password',
    passReqToCallback: true
}, function (admin_username, password, done) {
    Admin.authenticate(admin_username, password, function (error, user)
    {
        done(error, user, error ? {message: error.message} : null);
    });
});
 passport.use(authStrategy);
passport.use(new localStrategy('admin',{
 usernameField: 'admin_username',
 passwordField: 'password'
 },Admin.authenticate()));

//passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());
 */

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
    var err = new Error('Not Found');
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
//module.exports.gfs=gfs;
module.exports = app;
