'use strict';

const Gallery = require('../model/gallery');
const bodyParser = require('body-parser');
const errorHandler = require('../lib/error-handler');
const bearerAuthMiddleware = require('../lib/bearer-auth-middleware');

module.exports = router => {
  router.route('/gallery/:id?')
  //bearerAuthMiddleware is what checks to see if there's a user in request that's allowed to continue operation.
  //if no user in request, unable to authenticate user && move forward
    .post(bearerAuthMiddleware, bodyParser, (request, response) => {
      //vinicio - do i have request.user? if not, wrong token, w/e but not able to login/use app
      //if(!request.user) error etc. can be added, although a lil redundant

      request.body.userId = request.user._id;

      return new Gallery(request.body).save()
        .then(createdGallery => response.status(201).json(createdGallery))
        .catch(error => errorHandler(error, response));
    })
    
    .get(bearerAuthMiddleware, bodyParser, (request, response) => {
      //vinicio - returns one gallery (fetchOne)
      if(request.params._id)
        return Gallery.findById(request.params._id)
          .then(gallery => response.status(200).json(gallery))
          .catch(error => errorHandler(error, response));

      //vinicio - returns all gallerys (fetchAll)
      return Gallery.find()
        .then(galleries => {
          let galleriesIds = galleries.map(gallery => gallery._id);

          response.status(200).json(galleriesIds);
        })
        .catch(error => errorHandler(error, response));
    });

  // TODO .put()
  // TODO .delete()
};