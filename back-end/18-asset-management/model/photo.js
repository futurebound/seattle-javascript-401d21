'use strict';

const fs = require('fs'); //nodeJS
const del = require('del'); //NPM
const path = require('path'); //NodeJS, parses out filename and extension from a path, so we don't have to worry about parsing it ourself
const Gallery = require('../model/gallery');
const mongoose = require('mongoose');
const tempDir = `${__dirname}/../temp`;
const awsS3 = require('../lib/aws-s3');
const debug = require('debug')('http:photo');

const Photo = mongoose.Schema({
  name: {type: String, required: true}, //comes from request
  description: {type: String, required: true}, //comes from request
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'auth', required: true}, //comes from bearerAuth
  galleryId: {type: mongoose.Schema.Types.ObjectId, ref: 'gallery', required: true},
  objectKey: {type: String, required: true, unique: true}, //get from S3, 
  imageURI: {type: String, required: true, unique: true}, //get back from S3, actual hardcoded FULLPATH link to resource on S3
}, {timestamps: true});

//Photo.methods gives you protoype like inheritance, prototypes of SPECIFIC INSTANCE
//Photo.static is built in function on constructor, for example we don't have a schema until after we upload, so gotta be static on constructor since there is NO INSTANCE YET

//allows ability to pass photo DATA off to this method, going to make call to S3 middleware, which will then send photo off to S3, becomes own req/res cycle, which will send us back metadata, which we can then capture and save in MongoDB
Photo.statics.upload = function(req) {
  return new Promise((resolve, reject) => {
    if(!req.file) return reject(new Error('Multi-part Form Data Error. File not present on request.'));
    if(!req.file.path) return reject(new Error('Multi-part Form Data Error. File path not present on request.'));

    let params = {
      ACL: 'public-read', //Access Control List, sets up permissions on server
      Bucket: process.env.AWS_BUCKET,
      Key: `${req.file.filename}${path.extname(req.file.originalname)}`, //sets up filename for AWS to store the thing
      Body: fs.createReadStream(req.file.path), //tells fs module read file from this path on my machine and create stream of data
    };

    //creating data points for file AFTER been uploaded to S3, so then can package up and save to MongoDB
    return awsS3.uploadProm(params) //method we create in awsS3 module, DOES ALL HEAVY LIFTING and ships off data to S3
      .then(data => { //ON SUCCESS, get photo data back
        del([`${tempDir}/${req.file.filename}`]); //place where we store temp BINARY data, DEL package is shortcut for fs.unlink which DELETES the temp space, as long as S3 completes process and gives us data back
        //temp gives you ability to evaluate, log, check things, etc before storing

        let photoData = { //represents data we pass into new photo schema instance
          name: req.body.name,
          description: req.body.description,
          userId: req.user._id,
          galleryId: req.body.galleryId,
          imageURI: data.Location,
          objectKey: data.Key,
        };

        resolve(photoData);
      })
      .catch(reject);
  });
};

//.methods since its on a specific instance that already exists
// Photo.methods.delete = function() {

// }

module.exports = mongoose.model('photo', Photo);