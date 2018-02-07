'use strict';

const faker = require('faker');
const Auth = require('../../model/auth');
const Gallery = require('../../model/gallery');
const debug = require('debug')('http:mock');

const mock = module.exports = {};

// different mocks
mock.auth = {};
mock.gallery = {};

mock.auth.createOne = () => {
  let result = {};
  result.password = faker.name.lastName();

  debug('about to create a new mock.auth');
  return new Auth({
    username: faker.name.firstName(),
    email: faker.internet.email(),
  })
    .generatePasswordHash(result.password)
    .then(auth => result.auth = auth)
    .then(auth => auth.generateToken())
    .then(token => result.token = token)
    .then(() => {
      debug(`mock createOne result: ${result}`);
      debug(`mock createOne result.auth: ${result.auth}`);
      debug(`mock createOne result.token: ${result.token}`);
      return result;
    });
};

//MOCK FOR GALLERY AYY
mock.gallery.createOne = () => {
  let resultMock = {}; //variable to hold all results of the mocks

  //create mock for auth/user, then 
  //can either hardcode auth/user, or use mocks
  return mock.auth.createOne()
    .then(createdAuthMock => resultMock = createdAuthMock) //implicit return
    //could also resultMock.user = createdAuth
    .then(createdAuthMock => {
      return new Gallery({
        name: faker.internet.domainWord(),
        description: faker.lorem.words(15),
        userId: createdAuthMock.auth._id,
      }); //vinicio - something being saved into MongoDB CAN .SAVE() HERE INSTEAD 
      //IF SHIT BREAKING, REMOVE THAT GODDAMN .SAVE()
    })
    .then(gallery => {
      resultMock.gallery = gallery;
      console.log(resultMock);
      debug('galleryMock created, about to return');
      return resultMock;
    });
};

mock.auth.removeAll = () => Promise.all([Auth.remove()]);