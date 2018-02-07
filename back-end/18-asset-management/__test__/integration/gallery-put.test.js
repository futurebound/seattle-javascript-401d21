'use strict';

const faker = require('faker');
const mock = require('../lib/mocks');
const superagent = require('superagent');
const server = require('../../lib/server');
require('jest');

describe('#gallery-put', function() {
  beforeAll(server.start);
  beforeAll(() => this.base = `:${process.env.PORT}/api/v1/gallery`);
  // beforeAll(() => mock.auth.createOne().then(data => this.mockAuth = data));
  beforeAll(() => mock.gallery.createOne().then(data => this.mockGallery = data));
  afterAll(server.stop);
  afterAll(mock.auth.removeAll);
  afterAll(mock.gallery.removeAll);

  describe('valid input/output', () => {
    let updated = {
      name: 'pajamas',
      description: 'fire trucks',
    };

    it('should update existing record', () => {
      return superagent.put(`${this.base}/${this.mockGallery.gallery._id}`)
        .set('Authorization', `Bearer ${this.mockGallery.token}`)
        .send(updated)
        .then(res => {
          expect(res.status).toEqual(204);
        });
    });
  });

  describe('invalid input/output', () => {
    
  });
});