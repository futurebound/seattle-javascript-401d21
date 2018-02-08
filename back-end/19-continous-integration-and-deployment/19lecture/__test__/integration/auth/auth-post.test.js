'use strict';

const server = require('../../../lib/server');
const superagent = require('superagent');
const mock = require('../../lib/mocks');
const faker = require('faker');
require('jest');

describe('#auth-post /api/v1/signup', function () {
  beforeAll(() => this.base = `:${process.env.PORT}/api/v1/signup`);
  beforeAll(server.start);
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);

  describe('valid input/output', () => {
    beforeAll(() => {
      this.mockAuth = {
        username: faker.name.firstName(),
        password: faker.name.lastName(),
        email: faker.internet.email(),
      };

      return superagent.post(this.base)
        .send(this.mockAuth)
        .then(res => this.res = res)
        .catch(console.error);
    });
    
    it('should return a response status of 201', () => {
      expect(this.res.status).toBe(201);
    });
    it('should return a response with headers property', () => {
      expect(this.res).toHaveProperty('headers');
    });
    it('should return a token', () => {
      let tokenParts = this.res.body.split('.');
      let signature = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
      let token = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

      console.log(tokenParts);
      expect(signature.typ).toEqual('JWT');
      console.log(signature);
      expect(token).toHaveProperty('iat');
      expect(token).toHaveProperty('token');
      console.log(token);
    });
  });

  describe('invalid input/output', () => {
    it('should return an error when sending malformed data', () => {
      return superagent.post(`${this.base}`)
        .send()
        .catch(err => {
          expect(err).not.toBeNull();
        });
    });
    it('should return status 401 without required properties sent in request', () => {
      return superagent.post(`${this.base}`)
        .send()
        .catch(err => {
          expect(err.status).toBe(401);
        });
    });
    it('should return status 401 without required properties sent in request, with error message unauthorized', () => {
      return superagent.post(`${this.base}`)
        .send()
        .catch(err => {
          expect(err.message).toContain('Unauthorized');
        });
    });
    it('should return an error with bad path', () => {
      return superagent.post(`${this.base}/badpath`)
        .send()
        .catch(err => {
          expect(err).not.toBeNull();
        });
    });
    it('should return status 404 with bad path', () => {
      return superagent.post(`${this.base}/badpath`)
        .send()
        .catch(err => {
          expect(err.status).toBe(404);
        });
    });
    it('should return status 404 with bad path, with error message Not Found', () => {
      return superagent.post(`${this.base}/badpath`)
        .send()
        .catch(err => {
          expect(err.message).toContain('Not Found');
        });
    });
  });
});