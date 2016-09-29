var custom = function () {

    mongoose = require('mongoose');
    GridStore = mongoose.mongo.GridStore;
    Grid = require('gridfs-stream');
    fs = require('fs');
    async = require('async');


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
        //Storing file in to database if file is stored on disk
        new GridStore(
            mongoose.connection.db,
            file.filename,
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

        //Storing file into database if file is from buffer
        /*
         var gfs = new GridStore(
         mongoose.connection.db,
         file.originalname,
         'w+',
         {
         root: 'image',
         content_type: file.mimetype,
         metadata: file_id
         }
         ).open(function (err, gridstore) {
         if (err) {
         return fn(err);
         }

         gridstore.write(file.buffer, function (err, GS) {
         console.log("file written");
         if (err) throw err;
         GS.close(function (err, result) {
         if (err) throw err
         console.log(result);
         })
         });


         })*/
    }


    custom.prototype.readfromDB = function (file_id, callback) {

        var files_arr = [];
        var collection = mongoose.connection.db.collection("image.files");
        collection.find({'metadata': file_id})
            .toArray(function (err, files) {
                if (err)
                    callback(err, null)


                files.forEach(function (file) {
                    var element = {};
                    element.id = file._id;
                    element.name = file.filename;

                    var date = new Date();
                    var file_name = __dirname + "/../client/partials/images/uploads/" + file.filename;
                    files_arr.push(element);
                    var writestream = fs.createWriteStream(file_name);
                    var gridstore = new GridStore(mongoose.connection.db, file._id, "r", {root: 'image'});
                    gridstore.open(function (err, gridobj) {
                        if (err)
                            console.log(err);
                        var readstream = gridobj.stream(true);
                        readstream.on('end', function () {
                            console.log("End Called");
                        })
                        readstream.pipe(writestream);
                    })


                })

                callback(null, files_arr);
            });


    }

    custom.prototype.readAllFromDB = function (file_id, callback) {

        var files_arr = [];
        var collection = mongoose.connection.db.collection("image.files");
        collection.find({'metadata': file_id})
            .toArray(function (err, files) {
                if (err)
                    callback(err, null)


                files.forEach(function (file) {
                    var element = {};
                    element.id = file._id;
                    element.name = file.filename;

                    var date = new Date();
                    var file_name = __dirname + "/../client/partials/images/uploads/" + file.filename;
                    files_arr.push(element);
                    var writestream = fs.createWriteStream(file_name);
                    var gridstore = new GridStore(mongoose.connection.db, file._id, "r", {root: 'image'});
                    gridstore.open(function (err, gridobj) {
                        if (err)
                            console.log(err);
                        var readstream = gridobj.stream(true);
                        readstream.on('end', function () {
                            console.log("End Called");
                        })
                        readstream.pipe(writestream);
                    })


                })

                callback(null, files_arr);
            });


    }


    custom.prototype.deletefromDB = function (file, cb) {
        var db = mongoose.connection.db;
        console.log('Deleting GridFile ' + file.id);
        var gfs = Grid(mongoose.connection.db, mongoose.mongo);
        gfs.collection('image').remove({
            _id: mongoose.Types.ObjectId(file.id)
        }, function (err) {
            if (err) console.log(err);

            console.log('success ');
        });
        var filename = __dirname + "/../client/partials/images/uploads/" + file.name;
        fs.stat(filename, function (err, exists) {

            if (err)
                console.log(err)

            fs.unlink(filename, function (err) {
                if (err) return console.log(err);
                console.log('file deleted successfully');
            });

        });


        /*
         var store = new GridStore(mongoose.connection.db, Id, "w+");
         store.open(function (err, gridstore) {
         if(err)
         {
         console.log(err)
         }
         console.log(gridstore);
         gridstore.unlink(function (err, result) {
         if (err) {
         console.log('deleteGridFile ERROR ===================>' + err);
         }
         GridStore.exist(db, Id, function(err, result) {
         if(err)
         console.log(err);

         console.log(result);

         });

         });

         });*/

    }


}

module.exports = custom;
