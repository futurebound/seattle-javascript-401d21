'use strict';

const server = require('../../lib/server');
require('jest');

describe('#server-test', () => {
  it('should return a promise rejection if the server is already running when started', () => {
    server.start(process.env.PORT, () => console.log('server started')); //expecting both port && callback, so can't just invoke without passing PORT first
    server.start(process.env.PORT, err => {
      expect(err.message).toMatch(/server already running/i); // i is case insensitive in regex
    });
  });

  it('should return an error message if the server is already stopped when stopping', () => {
    return server.stop(err => {
      expect(err.message).toMatch(/server not running/i);
    });
  });
});