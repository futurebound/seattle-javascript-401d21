'use strict';

//associated record for a user in our application

const jwt = require('jsonwebtoken'); //auth token sent back to user when signup/signin
//has 2 API methods, sign() and verify()
const bcrypt = require('bcrypt'); //used to HASH & compare passwords in our database
const crypto = require('crypto'); //built into node, just like fs module, generates the compare hash for us
const mongoose = require('mongoose');
const debug = require('debug')('http:auth');

//hardcoded requirement for the model, anything in browser is client-side validation
const Auth = mongoose.Schema({
  username: {type: String, required: true, unique: true}, //unique here compares all the other ones, why all the good usernames are taken
  password: {type: String, required: true},
  email: {type: String, required: true},
  compareHash: {type: String, unique: true}, //sign and verify token, when decrypting token we get the compareHash value
}, {timestamps: true});

Auth.methods.generatePasswordHash = function(password) { //sets up method for each Auth schema so its available as needed
  //can validate here because it doesn't check if there's a password until the .save() is called on the schema
  debug('calling generatePasswordHash');
  if(!password) return Promise.reject(new Error('Authorization failed. Password required.')); //explicitly reject with new error

  return bcrypt.hash(password, 10) //10 is the saltrounds, i.e. # of rounds/steps of encryption
    .then(hash => this.password = hash) //hash returned, set this.password to the hashed password
    .then(() => {
      debug('bcrypt.hash success?');
      return this;
    }) //pass it on ayyy
    .catch(err => err);
};

Auth.methods.comparePasswordHash = function(password) {
  debug('calling comparePasswordHash');
  //don't worry about validation b/c pass nothing in will not confirm as valid, pass to error-handler
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => { //plain text password, hashed password, callback with err/valid as arguments
      if(err) return reject(err);
      //can also just generalize say 'AUTH FAILED.'
      if(!valid) return reject(new Error('Authorization failed. Password invalid.')); //only response passed to valid is TRUE/FALSE, no password back, no internal data, just T/F yes they good or no they not
      debug('comparePasswordHash success, can move forward');
      resolve(this); //just means they can move forward in the process
      //also don't have to return resolve
    }); 
  });
};

//use crypto nodeJS module, looking for random 32-byte string/value, then stringifiy into hexidecimal encoding
Auth.methods.generateCompareHash = function() { //VENICIO - TOKEN SEED
  debug('calling generateCompareHash');
  this.compareHash = crypto.randomBytes(32).toString('hex');
  return this.save()
  //if protecting against brute force, have helper function that would use a counter to stop further attempts
    .then(() => Promise.resolve(this.compareHash)) //explicit Promise resolve, pass back the created compareHash
    // .catch(() => this.generateCompareHash()); //calls until we get a UNIQUE COMPARE HASH, NOT very robust with security, potential loop
    //changed to console.error
    // .then(() => debug(`generateCompareHash success, ${this.compareHash}`))
    .catch(console.error);
};

Auth.methods.generateToken = function() {
  debug('calling generateToken');
  //if not this.generateCompareHash, would scope to MODULE not the SCHEMA
  return this.generateCompareHash() //on success, sends up A PROMISE
    .then(compareHash => jwt.sign({token: compareHash}, process.env.APP_SECRET))
    // .then(console.log)
    // .then(() => debug(`generateToken success`))
    .catch(err => err);
};

module.exports = mongoose.model('auth', Auth);