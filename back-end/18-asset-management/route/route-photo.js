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

  router.route('/photo/:id?')
  // middlewares in order, i.e. authenticate, parse body, upload single, callback
    .post(bearerAuth, bodyParser, upload.single('image'), (req, res) => {
      Photo.upload(req)
        //now have most parts/pieces, ship off to s3, haded back as photoData
        .then(photoData => new Photo(photoData).save())
        //assuming all went well, get pic back from MongoDB
        .then(pic => res.status(201).json(pic)) //pic just object representation with data, url reference, etc to S3 bucket where stored
        .catch(err => errorHandler(err, res));
    })
    .get(bearerAuth, (req, res) => {
      if(req.params.id) { //use .id no ._id b/c on line 22, the params is referencing what is specified in the route above
        return Photo.findById({userId: req.params.id})
          .then(pic => res.status(200).json(pic))
          .catch(err => errorHandler(err, res));
      }

      // Photo.find({userId: req.query.userId}) would be optional querystring
      Photo.find()
        .then(photos => photos.map(photo => photo._id))
        .then(ids => res.status(200).json(ids))
        .catch(err => errorHandler(err, res));
    });
};