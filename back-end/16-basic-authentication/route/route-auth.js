'use strict'

const Auth = require('../model/auth')
const errorHandler = require('../lib/error-handler')
const bodyParser = require('body-parser').json()
const basicAuth = require('../lib/basic-auth-middleware')

module.exports = function(router) {
  router.post('/signup', bodyParser, (req, res) => {
    //1st cache password sent with request body, remove it from request, so when boomerang goes full circle not still sitting in that piece of data
    let password = req.body.password
    delete req.body.password //should remove altogether form the body
    //dumps plaintext password after been hashed

    let user = new Auth(req.body)

    //generate/hash password, return as user so we can save user
    user.generatePasswordHash(password)
    .then(newUser => newUser.save()) //saved user with hashed password to DB
    .then(userRes => userRes.generateToken())
    // .then(token => { res.cookie() >>> options >>> maxAge = max age in milliseconds, expires it automatically >>> signed = signs the cookie >>> path = defaults to '/'
    //   res.cookie(`X-CFGRAM-TOKEN`, token) //some weird shit to store token in cookies ayyy
    //   res.status(201).json(token)
    // }) //we don't use this cuz HEROKU doesn't support cookie storage lke this, but would generally work , client would need to unpackage cookie in response object and store it
    .then(token => res.status(201).json(token)) //sends success response 201 created && JSON token of hashed password
    .catch(err => errorHandler(err, res)) //otherwise catch errors
  })

  router.get('/signin', basicAuth, (req, res) => {
    //find the user!! returns nothing if you pass it something && doesn't find matching thing
    Auth.findOne({username: req.auth.username})
    .then(user => {
      return user
      ? user.comparePasswordHash(req.auth.password) //we generating the .auth. data through our own middleware
      : Promise.reject(new Error('Authorization Failed. User not found.')) //or username required, etc.
    })
    //or do without code block, for implicit return since still one liner just broken out for readibility
    // .then(user =>
    //   user
    //   ? user.comparePasswordHash(req.auth.password) //we generating the .auth. data through our own middleware
    //   : Promise.reject(new Error('Authorization Failed. User not found.')) //or username required, etc.
    // )

    //got user, compared password hash, which on success should return entire user instance when resolved
    //then generate new token, format response, generat/catch errors
    .then(user => { //we've made it this far, so delete the password
      delete req.headers.authorization
      delete req.auth.password //gets rid of password
      return user
    }) 
    .then(user => user.generateToken())
    .then(token => res.status(200).json(token))
    .catch(err => errorHandler(err, res))
  })
}