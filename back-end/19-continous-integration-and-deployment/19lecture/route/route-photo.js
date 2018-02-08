'use strict';

//route dependencies
const Photo = require('../model/photo');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');
const bearerAuth = require('../lib/bearer-auth-middleware');

//photo upload dependencies & setup
const multer = require('multer'); //handles multi-part form data (image), setting on request as well as caching in temp directory
const tempDir = `${__dirname}/../temp`;
const upload = multer({dest: tempDir});

module.exports = function(router) {
  router.get('/photos/me', bearerAuth, (req, res) => {//makes so you need bearerAuth to access your own specific photos
    Photo.find({userId: req.user._id})
      .then(photos => photos.map(photo => photo._id))
      .then(ids => res.status(200).json(ids))
      .catch(err => errorHandler(err, res));
  });

  router.route('/photo/:_id?')
  // middlewares in order, i.e. authenticate, parse body, upload single, callback
  // at point of parsing image file, our request object should have a request.user, request.file, and request.body 
    .post(bearerAuth, bodyParser, upload.single('image'), (req, res) => {
      Photo.upload(req)
        //now have most parts/pieces, ship off to s3, handed back as photoData
        .then(photoData => new Photo(photoData).save())
        //assuming all went well, get pic back from MongoDB
        .then(pic => res.status(201).json(pic)) //pic just object representation with data, url reference, etc to S3 bucket where stored
        .catch(err => errorHandler(err, res));
    })
    .get(bearerAuth, (req, res) => {
      if(req.params._id) { //use ._id no ._id b/c on line 22, the params is referencing what is specified in the route above
        return Photo.findById({userId: req.params._id})
          .then(pic => res.status(200).json(pic))
          .catch(err => errorHandler(err, res));
      }

      // Photo.find({userId: req.query.userId}) would be optional querystring
      Photo.find()
        .then(photos => photos.map(photo => photo._id))
        .then(ids => res.status(200).json(ids))
        .catch(err => errorHandler(err, res));
    })

    .delete(bearerAuth, (req, res) => {
      Photo.findOne({userId: req.user._id, _id: req.params._id})
        .then(pic => {
          return pic
            ? pic.delete() //define this on Photo.methods.delete
            : Promise.reject(new Error('Path Error. Photo not found.'));
        })
        .then(() => res.sendStatus(204))
        .catch(err => errorHandler(err, res));
    });
};