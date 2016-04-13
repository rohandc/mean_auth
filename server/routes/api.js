/*

 -Authors:
 -Date:
 -Purpose:

 @param
 @

 */

"use strict";
//dependenciess
var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/user.js'),//Model for User registeration
    Apartment = require('../models/apartment_info.js'),

    apt = new Apartment(),//Model for Apartment registeration
    mongoose = require('mongoose'),
    Admin = require('../models/admin.js');

//Define Middleware Using ROUTER from EXPRESS
router.use('/', function (req, res, next) {
    // req.path will be the req.url with the /users prefix stripped
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

    passport.authenticate('local', function (err, user, info) {
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

    })(req, res, next);

});

router.get('/logout', function (req, res) {

    //res.status(200).json({status: 'Bye!'})
    req.logout();
    //req.flash('Success message', 'Logout Successfull');
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

//End of Routes
//Routes for Aparatments

router.post('/registerApt', function (req, res) {

    var conn = mongoose.connection;
    var files = req.files;
    var formdata = req.body;
    var picture = "";
    for (file in files) {
        file = files[file];
        var file_name = custom.generateObjectId("");
        custom.insertintoDB(file, file_name, function (res) {
            console.log(res);
        });
        picture += file_name + ",";
    }


    apt.name = formdata.name;
    apt.apartment_no = formdata.apartment_no;
    apt.street_name = formdata.street_name;
    apt.city = formdata.city;
    apt.postal_code = formdata.postal_code;
    apt.country = formdata.country;
    apt.rental_type = formdata.rental_type;
    apt.author = req.user.username;
    apt.picture = picture.replace(/,\s*$/, "");
    apt.price = formdata.price;
    apt.duration = formdata.duration;
    apt.occupants_no = formdata.occupants_no;
    apt.description = formdata.description;
    apt.rank = formdata.rank;

    /*Apartment=new Apartment({
     name:formdata.name,
     apartment_no: formdata.apartment_no,
     street_name: formdata.street_name,
     city: formdata.city,
     postal_code: formdata.postal_code,
     country: formdata.country,
     rental_type: formdata.rental_type,
     author: req.username,
     picture: req.files.originalname,
     price: formdata.price,
     duration: formdata.duration,
     occupants_no: formdata.occupants_no,
     description: formdata.description,
     rank: formdata.rank
     });*/

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

    /*  Apartment.findOne({_id: req.params.id})
     .populate("aptID")
     .exec(
     function (err, apts) {
     debugger;
     if (err) {
     console.log(err);
     res.send({status: 500, message: "Error Apartment not Found"});
     }
     imageObject = [];
     var images = apts.picture.split(",");
     images.forEach(function (image) {
     custom.readfromDB(image, function (err, response) {
     if (err)
     console.log(err);

     imageObject.push(response);
     console.log(imageObject);
     })
     console.log(imageObject);
     })
     // res.send(apts);
     });*/

    var apartment;
    var imageObject = [];

    Apartment.findOne({_id: req.params.id}).lean().stream()
        .on ("error", function (error) {
            console.log(error);
        })
        .on ("data", function (doc) {
            apartment = doc;

        })
        .on ("close", function () {

            var images = apartment.picture.split(",");
            images.forEach(function (image) {

                custom.readfromDB(image, function (err, response) {

                    if (err)
                    {
                        console.log(err);
                        return;
                    }
                    //apartment.picture=apartment.picture+response;
                    console.log(apartment);

                    /* apartment.methods.addfile(response, function (resp) {
                     console.log(resp);
                     })*/

                })

            })
            res.send(apartment);
        });


});

router.post('/updateApt/:id',function(req,res)
{
    var id=req.params.id;
    var formdata=req.body.data;
    apt.name = formdata.name;
    apt.apartment_no = formdata.apartment_no;
    apt.street_name = formdata.street_name;
    apt.city = formdata.city;
    apt.postal_code = formdata.postal_code;
    apt.country = formdata.country;
    apt.rental_type = formdata.rental_type;
    apt.author = req.username;
    apt.picture = "";
    apt.price = formdata.price;
    apt.duration = formdata.duration;
    apt.occupants_no = formdata.occupants_no;
    apt.description = formdata.description;
    apt.rank = formdata.rank;

    Apartment.findById(id,function(err,apartment){

        if(err) return next(err);

        // Render not found error
        if(!apartment) {
            return res.status(404).json({
                message: 'Course with id ' + id + ' can not be found.'
            });
        }

        // Update the course model
        apartment.update(formdata, function(error, apartment) {
            if(error) return next(error);

            res.send(apartment);
        });


    })


});

//End of Routes
//GET REQUEST ON CLICK SEARCH ADDED BY EUGENE
router.get('/search/city/:city/type/:type/duration/:duration_id/minprice/:minprice/maxprice/:maxprice/rank/:rank',
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
        }, function callback(err, apt) {
            if (err)
                console.log(err);
            // res.send(err);
            // debugger;
            // console.log(apt);

            res.send(apt);


        });

    });


router.get('/id/:_id',
    function (req, res) {
        // if(req.params.city && req.params.type=='undefined' && req.params.duration=='undefined' && req.params.minprice==null && req.params.maxprice==null && req.params.rank==null) {
        //     Apartment.find({city:req.params.city},callback);
        // }
        // if(req.params.city && req.params.type && req.params.minprice && req.params.maxprice) {
        //     Apartment.find({city:req.params.city,price:{$gt:req.params.minprice, $lte:req.params.maxprice}, type:req.params.type},callback);
        // }
        // else {
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


router.post('/admin/register', function (req, res,next)
{

    if(req.user)
    {
        req.logOut();
    }
    Admin.register(new Admin({username:req.body.username}), req.body.password, function (err, account) {
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

//console.log(router.stack);

module.exports = router;