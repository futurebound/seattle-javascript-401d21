'use strict';

const faker = require('faker');
const mock = require('../lib/mocks');
const superagent = require('superagent');
const server = require('../../lib/server');
require('jest');

describe('#gallery-post', function() {
  beforeAll(server.start);
  beforeAll(() => this.base = `:${process.env.PORT}/api/v1/gallery`);
  beforeAll(() => mock.auth.createOne().then(data => this.mockAuth = data));
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);
  afterAll(mock.gallery.removeAll);

  describe('Valid input/output', () => {
    beforeAll(() => {
      this.galleryMock = null;
      return mock.gallery.createOne()
        .then(mock => {
          this.galleryMock = mock;
          return superagent.post(this.base)
            .set('Authorization', `Bearer ${mock.token}`)
            .send({
              name: faker.name.firstName(),
              description: faker.lorem.words(10),
            });
        })
        .then(response => this.response = response);
    });

    it('should have a status 201', () => {
      console.log(this.response.body);
      expect(this.response.status).toBe(201);
    });
    it('should have name, description, _id properties', () => {
      expect(this.response.body).toHaveProperty('name');
      expect(this.response.body).toHaveProperty('description');
      expect(this.response.body).toHaveProperty('_id');
    });
    it('should have a userID equal to the mocks', () => {
      expect(this.response.body.userId).toEqual(this.galleryMock.gallery.userId.toString());
    });
  });

  describe('Invalid input/output', () => {
    it('should return 401 not-auth with bad token', () => {
      return superagent.post(this.base)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toBe(401));
    });
    it('should return a 400 bad-request on malformed body', () => {
      return superagent.post(this.base)
        .set('Authorization', `Bearer ${this.mockAuth.token}`)
        .send({})
        .catch(err => expect(err.status).toBe(400));
    });
  });
});