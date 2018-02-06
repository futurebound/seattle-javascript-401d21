'use strict';

const errorHandler = require('./error-handler');
const Auth = require('../model/auth');
const jwt = require('jsonwebtoken');

//constant value, expecting to use many times in code, convention is to capitalize
const ERROR_MESSAGE = 'Authorization Failed';

//process of defining express middleware, we need ot pass in request/response AND next
module.exports = function(req, res, next) {
  //unpackage request headers, to see if someone has set one with ANY value
  //then break apart value of auth header, make sure it has right sstructure/format
  //further vreak apart that piece, ensure username and password in there
  //once validated, take user/pass packag up on an object assigned to .auth on request
  let authHeaders = req.headers.authorization;
  if(!authHeaders) return errorHandler(new Error('Authorization Failed. Headers do not match requirements.'), res);

  //looking for user/password in base64 encoded string thats JUST AFTER 'Basic '
  let base64 = authHeaders.split('Basic ')[1];
  //validate theres something where it should be ayy
  if(!base64) return errorHandler(new Error('Authorization Failed. Username and password required.'), res);

  //taking what SHOULD be base64 encoded string, passing into a buffer, notifying buffer that it is a base64 encoding, then stringifying back to UTF-8, then splits at ':' to give the multiple indexes that match to [username, password]
  let [username, password] = Buffer.from(base64, 'base64').toString().split(':');
  req.auth = {username, password};

  //validation of things actually beinged passed and assigned to req.auth object
  if(!req.auth.username) return errorHandler(new Error('Authorization Failed. Username required.'));
  if(!req.auth.password) return errorHandler(new Error('Authorization Failed. Password required.'));

  //assumption here is that EVERYTHING UP TIL NOW HAS WORKED OUT AYY, structure of headers is good, have what we need to say next() which kicks us bak to callback in route-auth.js
  next();
};

//vinicio
module.exports = function(request, response, next) {
  let authHeader = request.headers.authorization;
  if(!authHeader) return errorHandler(new Error(ERROR_MESSAGE), response);

  let token = authHeader.split('bearer ')[1];
  if(!token) return errorHandler(new Error(ERROR_MESSAGE), response);

  //at this point we have a TOKEN
  //checking if it can be done, and if it CAN, will give you back decodedValue on success
  jwt.verify(token, process.env.APP_SECRET, (error, decodedValue) => {
    if(error) {
      error.message = ERROR_MESSAGE;
      return errorHandler(error, response);
    }

    //vinicio - at this point, we have decoded/decrypted value, which is tokenSeed/compareHash
    Auth.findOne({compareHash: decodedValue.token})
      .then(user => {
        if(!user) return errorHandler(new Error(ERROR_MESSAGE), response);
        //vinicio - we are mutating the request with a user on success, not if there's an issue
        //vinicio - at this point, we are verified as logged in
        request.user = user;
        next();
      })
      .catch(error => errorHandler(error, response));
  });
};