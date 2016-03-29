// user model
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');


var Admin = new Schema(
    {
        admin_username: String,
        password:String,
        email: {type:String,lowercase:true}
    });



Admin.plugin(passportLocalMongoose);
module.exports = mongoose.model('admin', Admin);