'use strict';

const server = require('../../lib/server');
const superagent = require('superagent');
const mock = require('../lib/mocks');
const faker = require('faker');
const errorHandler = require('../../lib/error-handler');
require('jest');

describe('#auth-get /api/v1/signin', function () {
  beforeAll(() => this.base = `:${process.env.PORT}/api/v1/signin`);
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(mock.auth.removeAll);

  describe('valid input/output', () => {
    beforeAll(() => {
      return mock.auth.createOne()
        .then(auth => this.mockAuth = auth)
        .then(() => {
          console.log(this.mockAuth);
        });
          // this.mockAuth = {
          //   username: faker.name.firstName(),
          //   password: faker.name.lastName(),
          //   email: faker.internet.email(),
          // };

        //   return superagent.post(`${this.base}`)
        //     .send(this.mock)
        //     .then(res => this.response = res)
        //     .catch(err => errorHandler(err));
        // });
    });


    it('should return a response status of 201', () => {
      return superagent.get(`${this.base}`)

        .then(res => {
          expect(res.status).toBe(200);
        });
        // .catch(console.error);
    });
    // it('should return a response with headers property', () => {
    //   expect(this.response).toHaveProperty('headers');
    // });
    // it('should POST a new Auth and respond with a hashed string', () => {
    //   expect(this.response.body).toContain('eyJhbGciOiJIUzI1NiJ9.');
    // });
  });

  // describe('invalid input/output', () => {
  //   it('should return an error when sending malformed data', () => {
  //     return superagent.post(`${this.base}`)
  //       .send()
  //       .catch(err => {
  //         expect(err).not.toBeNull();
  //       });
  //   });
  //   it('should return status 401 without required properties sent in request', () => {
  //     return superagent.post(`${this.base}`)
  //       .send()
  //       .catch(err => {
  //         expect(err.status).toBe(401);
  //       });
  //   });
  //   it('should return status 401 without required properties sent in request, with error message unauthorized', () => {
  //     return superagent.post(`${this.base}`)
  //       .send()
  //       .catch(err => {
  //         expect(err.message).toContain('Unauthorized');
  //       });
  //   });
  //   it('should return an error with bad path', () => {
  //     return superagent.post(`${this.base}/badpath`)
  //       .send()
  //       .catch(err => {
  //         expect(err).not.toBeNull();
  //       });
  //   });
  //   it('should return status 404 with bad path', () => {
  //     return superagent.post(`${this.base}/badpath`)
  //       .send()
  //       .catch(err => {
  //         expect(err.status).toBe(404);
  //       });
  //   });
  //   it('should return status 404 with bad path, with error message Not Found', () => {
  //     return superagent.post(`${this.base}/badpath`)
  //       .send()
  //       .catch(err => {
  //         expect(err.message).toContain('Not Found');
  //       });
  //   });
  // });
});