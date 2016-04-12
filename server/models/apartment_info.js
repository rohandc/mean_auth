var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validatepostal = function (postal) {
    var postalregex = /^[ABCEGHJKLMNPRSTVXY][0-9][ABCEGHJKLMNPRSTVWXYZ] ?[0-9][ABCEGHJKLMNPRSTVWXYZ][0-9]$/;
    return postalregex.test(postal);
}

var Apartment = new Schema(
    {

        name: String,
        apartment_no: String,
        street_name: {type: String, required: true},
        city: String,
        province:String,
        postal_code: {
            type: String,
            trim: true,
            validate: [validatepostal, 'Please fill a valida Postal Code']
        },
        country: String,
        rental_type: String,
        author: String,
        picture: String,
        price: {
            type: Number,
            get: function (num) {//Retreive the value in Dollars
                return parseInt((num / 100).toFixed(2));
            },
            set: function (num) {//Convert the value to Cents
                return parseInt(num * 100);
            }
        },
        duration: String,
        occupants_no: {
            type: Number,
            set: function (num) {
                return parseInt(num);
            }

        },
        description: String,
        rank: {
            type: Number, default: 0,
            set: function (num) {
                return parseInt(num);
            }
        }
        ,
        files:[Schema.Types.Mixed]
    },
    {

        toJSON: { virtuals: true } //needed for virtuals to be sent as  Json
    });

Apartment.virtual('address').get(function () {

    return (this.apartment_no + ", " + this.street_name + "," + this.city + "," + this.country + " ," + this.postal_code);
});

Apartment.methods.addfile=function(file,cb){
    var self=this;
    self.files.push(file);
    return self.save(cb("success"));
}

/*
var counter = mongoose.model('counter', Apartment);

var entitySchema = Schema({
    testvalue: {type: String}

 entitySchema.pre('save', function (next) {
 var doc = this;
 counter.findByIdAndUpdate({_id: 'entityId'}, {$inc: {rank: 1}}, function (error, counter) {
 if (error)
 return next(error);
 doc.testvalue = counter.seq;
 next();
 });
 });
});*/


var apartment=mongoose.model('Apartments', Apartment);

module.exports = apartment;