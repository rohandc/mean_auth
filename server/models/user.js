// user model
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');


var User = new Schema(
    {
        username: String,
        password:String,
        email: String
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