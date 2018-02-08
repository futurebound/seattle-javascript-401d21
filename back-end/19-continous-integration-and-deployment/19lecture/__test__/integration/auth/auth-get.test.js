'use strict';

const server = require('../../../lib/server');
const superagent = require('superagent');
const mock = require('../../lib/mocks');
const debug = require('debug')('http:auth-get.test');
require('jest');

describe('#auth-get GET /api/v1/signin', function () {
  beforeAll(() => this.base = `:${process.env.PORT}/api/v1/signin`);
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(mock.auth.removeAll);

  describe('valid input/output', () => {
    beforeAll(() =>
      mock.auth.createOne()
        .then(auth => this.mockAuth = auth)
        .then(() => {
          console.log(this.mockAuth);
          debug(`this.mockAuth: ${this.mockAuth}`);
        }));

    beforeAll(() => {
      debug(`this.mockAuth: ${this.mockAuth}`);
      let encoded = Buffer.from(`${this.mockAuth.auth.username}:${this.mockAuth.password}`).toString('base64');

      return superagent.get(this.base)
        .set('Authorization', `Basic ${encoded}`)
        .then(res => this.res = res)
        .then(() => console.log(this.res.body))
        .catch(console.error);
    });

    it('should return a response status of 200', () => {
      expect(this.res.status).toBe(200);
    });
    it('should return a JSON web token as response body', () => {
      console.log(this.res.body);
      let tokenParts = this.res.body.split('.');
      let signature = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
      let token = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

      expect(signature.typ).toEqual('JWT');
      console.log(signature.typ);
      expect(token).not.toBeNull();
      expect(token).toHaveProperty('iat');
      expect(token).toHaveProperty('token');
      console.log(token);
    });
  });

  describe('invalid input/output', () => {
    it('should return 401 not auth with invalid username', () => {
      let encoded = Buffer.from(`${'BADUSERAYYY'}:${this.mockAuth.password}`).toString('base64');

      return superagent.get(this.base)
        .set('Authorization', `Basic ${encoded}`)
        .catch(err => expect(err.status).toBe(401));
    });
    it('should return 401 not auth with invalid password', () => {
      let encoded = Buffer.from(`${this.mockAuth.auth.username}:${'BADPASSWAYAYAY'}`).toString('base64');

      return superagent.get(this.base)
        .set('Authorization', `Basic ${encoded}`)
        .catch(err => expect(err.status).toBe(401));
    });
    it('should return 401 not auth with no username', () => {
      let encoded = Buffer.from(`:${this.mockAuth.password}`).toString('base64');

      return superagent.get(this.base)
        .set('Authorization', `Basic ${encoded}`)
        .catch(err => expect(err.status).toBe(401));
    });
    it('should return 401 not auth with no password', () => {
      let encoded = Buffer.from(`${this.mockAuth.auth.username}:`).toString('base64');

      return superagent.get(this.base)
        .set('Authorization', `Basic ${encoded}`)
        .catch(err => expect(err.status).toBe(401));
    });
    it('should return 401 not auth with malformed auth headers', () => {
      return superagent.get(this.base)
        .set('Authorization', `Basic`)
        .catch(err => expect(err.status).toBe(401));
    });
    it('should return 401 not auth with no password', () => {
      return superagent.get(this.base)
        .catch(err => expect(err.status).toBe(401));
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
  
