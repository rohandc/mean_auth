/*
 -Authors:
 -Date:
 -Purpose:

 @param
 @

 */
"use strict";
//Dependencies
var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/user.js'),//Model for User registeration
    Apartment = require('../models/apartment_info.js'),
    apt = new Apartment(),//Model for Apartment registeration
    mongoose = require('mongoose'),
    fs = require('fs'),
    async = require('async'),
    Admin = require('../models/admin.js'),
    custom = require('../Custom');


//Define Middleware Using ROUTER from EXPRESS
router.use('/', function (req, res, next) {
    console.log("Inside API_JS using Router : " + req.path + " || " + req.url);
    next();
});


//Routes for User Authorization
router.post('/register', function (req, res) {
    User.register(new User({username: req.body.username}), req.body.password, function (err, account) {
        if (err) {
            return res.status(500).json({err: err})

        }
        passport.authenticate('user')(req, res, function () {
            return res.status(200).json({status: 'Registration successful!'})
        });
    });
});

router.post('/login', function (req, res, next) {


    passport.authenticate('user', function (err, user, info) {
            if (err) {
                return next(err)
            }
            if (!user) {
                return res.status(401).json({err: info})
            }
            req.logIn(user, function (err) {
                if (err) {
                    return res.status(500).json({err: 'Could not log in user'})
                }
                res.status(200).json({status: 'Login successful!'})
            });
        }
    )(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');

});

router.get('/status', function (req, res) {

    console.log("Inside  status ");

    if (req.user) {
        //console.log("Authenticated");
        res.status(200).json(req.user);
    }
    else {
        console.log("Doesnt exist req.user");
        res.status(500).json({err: "User not Logged In!,Please Login"});
    }
});


router.get('/current_user', function (req, res) {
    if (req.user) {
        User.findById(req.user.id, function (err, user) {
            if (err)
                console.log(err);

            res.status(200).send(user);
        })
    }


});


//Multer test
var multer = require('multer');
var profile_pic = [];
var storage = multer.diskStorage({
    destination: './client/partials/images/uploads/',
    filename: function (req, file, cb) {
        var name = file.originalname;
        var name1 = name.substring(0, name.lastIndexOf("."));
        var type = name.substring(name.indexOf("."), name.length);
        profile_pic.push(name1 + '-' + Date.now() + type);
        cb(null, name1 + '-' + Date.now() + type);
    }
});
var upload = multer({storage: storage}).any('profile');

router.post('/profileUpdate', function (req, res) {

    var obj = JSON.parse(req.body.data)
    obj.profile_image = "/partials/images/uploads/" + profile_pic[0];


    User.findById(req.user._id, {}, function (err, user) {

        if (err) return next(err);

        if (!user) {
            return res.status(404).json({
                message: "User " + req.user.username + " cannot be found"
            });
        }
        fs.stat(__dirname + "/../../client/" + user.profile_image, function (err, file) {

            if (err == null) {
                fs.unlink(__dirname + "/../../client/" + user.profile_image, function (err) {
                    if (err)
                        console.log(err);

                    console.log('successfully deleted file');
                });
            }
            else {
                console.log(err + " Some error");
            }


        })


        // Update the course model
        user.update(obj, function (error, user) {
            if (error) return next(error);

            res.send(user);
            profile_pic = [];
        });

    });


});


//End of Routes

//Routes for search

router.get('/search', function (req, res) {
    var query = req.query;
    console.log(query);
    var terms = query.searchText.split(' ');
    var regexString = "";

    for (var i = 0; i < terms.length; i++) {
        regexString += terms[i];
        if (i < terms.length - 1) regexString += '|';
    }

    var re = new RegExp(regexString, 'ig');


    Apartment.find(/*{
     $or: [{
     rank: parseInt(query.rating),
     rental_type: query.rentType,
     duration: parseInt(query.duration),
     price: {'$gte': 233, '$lte': 213},
     apartment_no:re,
     street_name:re,
     city:re,
     country:re,
     postal_code:re
     }]
     },*/ function (err, apt) {
        if (err)
            console.log(err);

        res.send(apt);

    });

});


//Routes for Apartments

router.post('/registerApt', function (req, res) {

    var dirname = require('path').dirname(__dirname);


    var files = req.files;
    var formdata = req.body;
    var picture = custom.prototype.generateObjectId("");
    files.forEach(function (file) {
        custom.prototype.insertintoDB(file, picture, function (res) {
            console.log(res);
        });
    });


    apt.name = formdata.name;
    apt.apartment_no = formdata.apartment_no;
    apt.street_name = formdata.street_name;
    apt.city = formdata.city;
    apt.postal_code = formdata.postal_code;
    apt.country = formdata.country;
    apt.rental_type = formdata.rental_type;
    apt.author = req.user.username;
    apt.files = picture;
    apt.price = formdata.price;
    apt.duration = formdata.duration;
    apt.occupants_no = formdata.occupants_no;
    apt.description = formdata.description;
    apt.rank = formdata.rank;
    apt.save(function (err, success) {
        if (err) {
            console.log("Error :" + err);
            res.send(err);
        }

        if (success) {
            console.log("Success :" + success);
            res.send(success);
        }
    });
    req.files = [];

});
router.get('/getApt', function (req, res) {
    Apartment.find(function (err, apartments) {

        if (err)
            console.log(err);


        res.send(apartments);
    });

});
router.delete('/deleteApt/:id', function (req, res) {

    Apartment.findByIdAndRemove(req.params.id, function (err, apt) {
        if (err) {
            console.log(err);
            res.send({status: 500, message: "Error Deleting try again later"});
        }

        console.log(apt + " deleted Apartment");
        res.send({status: 200, message: apt.name + " deleted"})
    })

});

router.get('/getApt/:id', function (req, res) {


    var apartment;
    var imageObject = [];

    Apartment.findOne({_id: req.params.id}).lean().stream()
        .on("error", function (error) {
            console.log(error);
        })
        .on("data", function (doc) {
            apartment = doc;

        })
        .on("close", function () {

            console.log(apartment.files);

            custom.prototype.readfromDB(apartment.files, function (err, store) {
                if (err)
                    console.log('get file error ===============');

                apartment.files = store;
                res.send(apartment);


            });


        });


});

router.post('/updateApt/:id', function (req, res) {
    var id = req.params.id;
    var formdata = req.body;
    var files = req.files;

    Apartment.findById(id, function (err, apartment) {

        if (err) return next(err);

        if (!apartment) {
            return res.status(404).json({
                message: 'Course with id ' + id + ' can not be found.'
            });
        }
        //Update New Images over Here

        files.forEach(function (file) {
            custom.prototype.insertintoDB(file, apartment.files, function (res) {
                console.log(res);
            });
        });

        apartment.update(formdata, function (error, apartment) {
            if (error) console.log(error);

            res.send(apartment);
        });


    })


});


//API to Delete Image from PopUp
router.post('/deleteimage', function (req, res) {

    console.log(req.body);

    var files = req.body;

    files.forEach(function (file) {
        custom.prototype.deletefromDB(file);

    })

});

//End of Routes

/*router.get('/search/city/:city/type/:type/duration/:duration_id/minprice/:minprice/maxprice/:maxprice/rank/:rank',
 function (req, res) {
 // if(req.params.city && req.params.type=='undefined' && req.params.duration=='undefined' && req.params.minprice==null && req.params.maxprice==null && req.params.rank==null) {
 //     Apartment.find({city:req.params.city},callback);
 // }
 // if(req.params.city && req.params.type && req.params.minprice && req.params.maxprice) {
 //     Apartment.find({city:req.params.city,price:{$gt:req.params.minprice, $lte:req.params.maxprice}, type:req.params.type},callback);
 // }
 // else {
 Apartment.find({
 city: req.params.city,
 price: {$gt: req.params.minprice, $lte: req.params.maxprice}
 }, function (err, apt) {
 if (err)
 console.log(err);

 res.send(apt);

 });

 });*/


router.get('/id/:_id',
    function (req, res) {
        Apartment.find({"_id": req.params._id}, {
            _id: 0,
            apartment_no: 1,
            street_name: 1,
            city: 1,
            postal_code: 1,
            country: 1,
            rental_type: 1,
            author: 1,
            price: 1,
            duration: 1,
            occupants_no: 1,
            description: 1,
            rank: 1
        }, function callback(err, apt) {
            if (err)
                console.log(err);
            // res.send(err);
            // debugger;
            // console.log(apt);

            res.send(post);

        });

    });

//Routes for Admin

router.post('/admin/register', function (req, res, next) {

    if (req.user) {
        req.logOut();
    }
    Admin.register(new Admin({username: req.body.username}), req.body.password, function (err, account) {
        if (err) {
            return res.status(500).json({err: err})
        }


        passport.authenticate('admin')(req, res, function () {

        });
    });


    res.status(200).json("Redirect");


});


router.post('/admin/login', function (req, res, next) {

    passport.authenticate('admin', function (err, user, info) {
            if (err) {
                return next(err)
            }
            if (!user) {
                return res.status(401).json({err: info})
            }
            req.logIn(user, function (err) {
                if (err) {
                    return res.status(500).json({err: 'Could not log in user'})
                }
                res.status(200).json("success");
            });
        }
    )(req, res, next);
});

router.get('/admin/apartments', function (req, res, next) {
    Apartment.find(function (err, apt) {

        if (err)
            console.log(err);

        res.send(apt);
    })
});


//console.log(router.stack);
module.exports = router;
module.exports.upload = upload;