// user model
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');


var User = new Schema(
    {
        username: String,
        password:String,
            email: {type: String, default: "-"},
            profile_image: {type: String, default: "partials/images/profile_images/default.jpg"},
            first_name: {type: String, default: "-"},
            last_name: {type: String, default: "-"},
            contact_number: {type: String, default: "-"},
            gender: String
    });

User.plugin(passportLocalMongoose);

//User.pre('save', function (next) {
//    this.find({name : this.name}, function (err, docs) {
//        if (!docs.length){
//            next();
//        }else{
//            console.log('user exists: ',this.name);
//            next(new Error("User exists!"));
//        }
//    });
//}) ;


module.exports = mongoose.model('users', User);