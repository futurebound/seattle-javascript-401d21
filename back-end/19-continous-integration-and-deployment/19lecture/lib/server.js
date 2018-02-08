'use strict';

//app dependencies
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const errorHandler = require('./error-handler');
const debug = require('debug')('http:server');

//app setup
const app = express();
const PORT = process.env.PORT;
const router = express.Router();
const MONGODB_URI = process.env.MONGODB_URI;

//middleware > to mount cors, set up base route or router, require in auth routes, setup 404 error handler
app.use(cors());
app.use('/api/v1', router);
require('../route/route-auth')(router);
require('../route/route-photo')(router);
require('../route/route-gallery')(router);
app.all('/{0,}', (req, res) => errorHandler(new Error('Path Error. Route not found.'), res)); //actually valid, '/*' can break things
//NOTE THE RES IS NOT IN LECTURE CODE SEE HERE IF PROBLEMS AYY


//server controls
const server = module.exports = {};

server.start = () => {
  return new Promise((resolve, reject) => {
    if(server.isOn) return reject(new Error('Server Error. Cannot start server on the same port when already running.'));
    server.http = app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
      server.isOn = true;
      mongoose.connect(MONGODB_URI);
      debug(`mongoose connection to ${MONGODB_URI} on port ${PORT}`);
      return resolve(server);
    });
  });
};

server.stop = () => {
  return new Promise((resolve, reject) => {
    if(!server.isOn) return reject(new Error('Server Error. Cannot stop server that is not running.'));
    server.http.close(() => {
      console.log(`shutting down server`);
      server.isOn = false;
      mongoose.disconnect();
      debug(`mongoose disconnected, server shut down`);
      return resolve();
    });
  });
};
