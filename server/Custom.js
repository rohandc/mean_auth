var custom = function () {

    mongoose = require('mongoose');
    GridStore = mongoose.mongo.GridStore;
    Grid = require('gridfs-stream');
    fs = require('fs');

    custom.prototype.initializeMongoose = function (callback) {
        var mongoLocal = "mongodb://localhost/mean-auth"

        var connection = {};
        if (mongoose.connection.readyState == 0) {
            mongoose.connect(mongoLocal, function (err) {
                if (err) {
                    console.log('connection error', err);
                    callback({ret: -1});
                } else {
                    console.log('connection successful');
                    callback({ret: 0});
                }
            });
            Grid.mongo = mongoose.mongo;
            connection = {conn: mongoose.connection}
        }
        else {
            console.log(mongoose.connection.readyState);
            connection = {conn: mongoose.connection}
        }
        callback(connection)

    }

    custom.prototype.generateObjectId = function (prefix) {
        var id = mongoose.Types.ObjectId();
        return prefix + String(id);
    }


    custom.prototype.insertintoDB = function (file, file_id, fn) {

        new GridStore(
            mongoose.connection.db,
            file_id, file.originalname,
            'w',
            {
                root: 'image',
                content_type: file.mimetype,
                metadata: file_id
            })
            .open(function (err, gridstore) {
                if (err) {
                    return fn(err);
                }
                else {
                    gridstore.writeFile(file.path, fn("success"));
                }
            });

    }

    custom.prototype.readfromDB = function (file_id, callback) {

        new GridStore(mongoose.connection.db, file_id, file_id, "r", {root: 'image'})
            .open(function (err, store) {

                if (err) {

                    console.log(err);

                    return callback(err);
                }
                else {

                    return callback(null, store);
                }
            })
    }


    custom.prototype.deletefromDB = function () {
        var db = mongoose.connection.db;

        id = parseInt(id);
        console.log('Deleting GridFile ' + id);

        var store = new GridStore(db, id, id, 'r');
        store.unlink(function (err, result) {
            if (err) {
                console.log('deleteGridFile ERROR ===================');
                return fn(err);
            }

            for (var k in result) {
                console.log(k);
            }
            return fn(null);
        });

    }
}

module.exports = custom;
