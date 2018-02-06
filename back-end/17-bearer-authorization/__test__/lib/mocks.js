'use strict';

const faker = require('faker');
const Auth = require('../../model/auth');
const debug = require('debug')('http:mock')

const mock = module.exports = {};

// different mocks
mock.auth = {};
mock.gallery = {};

mock.auth.createOne = () => {
  let result = {};
  result.password = faker.name.lastName();

  // let auth = new Auth({
  //   username: faker.name.firstName(),
  //   email: faker.internet.email(),
  // });

  return new Auth({
    username: faker.internet.userName(),
    email: faker.internet.email(),
  })
    .generatePasswordHash(result.password)
    .then(user => result.user = user)
    .then(user => user.generateToken())
    .then(token => result.token = token)
    .then(() => {
      debug(`mock createOne result: ${result}`);
      return result;
    })

  // return auth.generatePasswordHash(result.password)
  //   .then(auth => {
  //     result.auth = auth;
  //     return auth.save();
  //   })
  //   .then(auth => auth.generateToken())
  //   .then(token => {
  //     result.token = token;
  //     return result;
  //   });
};

// mock.auth.createOne = () => new Auth({
//   username: faker.name.firstName(),
//   password: faker.name.lastName(),
//   email: faker.internet.email(),
// }).save();

mock.auth.createMany = n =>
  Promise.all(new Array(n).fill(0).map(mock.auth.createOne));

mock.auth.removeAll = () => Promise.all([Auth.remove()]);

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
        description: faker.internet.words(15),
        userId: createdAuthMock.auth._id,
      }) //vinicio - something being saved into MongoDB CAN .SAVE() HERE INSTEAD 
    })
    .then(gallery => resultMock.gallery = gallery); //implicit return is the resultMock.gallery
    // .then() 
};