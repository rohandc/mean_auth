var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imagesSchema = new Schema({
    _id: String,
    seq: Number
});

module.exports = mongoose.model('images', imagesSchema);