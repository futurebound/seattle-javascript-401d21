'use strict';

const Gallery = require('../model/gallery');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');
const bearerAuthMiddleware = require('../lib/bearer-auth-middleware');
const debug = require('debug')('http:route-gallery');

const ERROR_MESSAGE = 'Authorization Failed';

module.exports = router => {
  router.route('/gallery/:_id?')
  //bearerAuthMiddleware is what checks to see if there's a user in request that's allowed to continue operation.
  //if no user in request, unable to authenticate user && move forward
    .post(bearerAuthMiddleware, bodyParser, (request, response) => {
      //vinicio - do i have request.user? if not, wrong token, w/e but not able to login/use app
      //if(!request.user) error etc. can be added, although a lil redundant
      debug('POST route-gallery');
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
          .then(() => debug('GET called on single ID, status 200'))
          .catch(error => errorHandler(error, response));

      //vinicio - returns all gallerys (fetchAll)
      return Gallery.find()
        .then(galleries => {
          let galleriesIds = galleries.map(gallery => gallery._id);

          response.status(200).json(galleriesIds);
        })
        .then(() => debug('GET called on all gallery schema, status 200'))
        .catch(error => errorHandler(error, response));
    })

    .put(bearerAuthMiddleware, bodyParser, (request, response) => {
      debug('PUT route-gallery, about to call Gallery.findById');
      Gallery.findOne({ //will find us a gallery that matches the user id,
        userId: request.user._id,
        _id: request.params.id,
      })
        .then(/* could do some error handling here, similar to line 66 if conditional*/)
        .then(gallery => {
          if (!gallery) return Promise.reject(new Error('Validation Error.'));
          return gallery.set(request.body).save();
        })
        .then(() => {
          debug('PUT success, 204 sent');
          return response.sendStatus(204);
        })
        .catch(error => errorHandler(error, response));

      // STUFF FROM TUESDAY
      // Gallery.findById(request.params._id, request.body)
      // Gallery.findById(request.params._id)
      //   .then(gallery => {
      //     if(gallery.userId.toString() === request.user._id.toString()) {
      //       gallery.name = request.body.name || gallery.name;
      //       gallery.description = request.body.description || gallery.description;

      //       debug('PUT route-gallery, about to save new gallery');
      //       return gallery.save();
      //     }
      //     return errorHandler(new Error(ERROR_MESSAGE), response);
      //   })
      //   .then(() => {
      //     debug('PUT success, 204 sent');
      //     return response.sendStatus(204);
      //   })
      //   .catch(error => errorHandler(error, response));
    })

    .delete(bearerAuthMiddleware, (request, response) => {
      debug('DELETE route-gallery, about to call Gallery.findById');
      return Gallery.findById(request.params._id)
        .then(gallery => {
          if(gallery.userId.toString() === request.user._id.toString()) {
            debug('DELETE route-gallery userIDs match, about to call gallery.remove()');
            return gallery.remove();
          }

          return errorHandler(new Error(ERROR_MESSAGE), response);
        })
        .then(() => {
          debug('DELETE route-gallery success, status 204 sent');
          return response.sendStatus(204);
        })
        .catch(error => errorHandler(error, response));
    });
};