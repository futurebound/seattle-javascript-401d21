'use strict';

const errorHandler = require('./error-handler');
const Auth = require('../model/auth');
const jwt = require('jsonwebtoken');

//constant value, expecting to use many times in code, convention is to capitalize
const ERROR_MESSAGE = 'Authorization Failed';

//vinicio
module.exports = function (request, response, next) {
  let authHeader = request.headers.authorization;
  if (!authHeader) return errorHandler(new Error(ERROR_MESSAGE), response);

  let token = authHeader.split('bearer ')[1];
  if (!token) return errorHandler(new Error(ERROR_MESSAGE), response);

  //at this point we have a TOKEN
  //checking if it can be done, and if it CAN, will give you back decodedValue on success
  jwt.verify(token, process.env.APP_SECRET, (error, decodedValue) => {
    if (error) {
      error.message = ERROR_MESSAGE;
      return errorHandler(error, response);
    }

    //vinicio - at this point, we have decoded/decrypted value, which is tokenSeed/compareHash
    Auth.findOne({ compareHash: decodedValue.token })
      .then(user => {
        if (!user) return errorHandler(new Error(ERROR_MESSAGE), response);
        //vinicio - we are mutating the request with a user on success, not if there's an issue
        //vinicio - at this point, we are verified as logged in
        request.user = user;
        next();
      })
      .catch(error => errorHandler(error, response));
  });
};