'use strict';

//app dependencies
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const errorHandler = require('./error-handler');
const debug = require('debug');

//app setup
const app = express();
const router = express.Router();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

//middleware > to mount cors, set up base route or router, require in auth routes, setup 404 error handler
app.use(cors());
app.use('/api/v1', router);
require('../route/route-auth')(router);
app.all('/{0,}', (req, res) => {
  errorHandler(new Error('Path Error. Route not found.')) //actually valid, '/*' can break
})


//server controls
const server = module.explorts = {};
server.start = () => {
  return new Promise((resolve, reject) => {
    if(server.isOn) return reject(new Error('Server Error. Cannot start server on the same port when already running.'));
    server.http = app.listen(PORT, () => {
      console.log(`lisening on ${PORT}`);
      server.isOn = true;
      mongoose.connect(MONGODB_URI);
      return resolve(server);
    });
  });
};
server.stop = () => {
  return new Promise((resolve, reject) => {
    if(server.isOn) return reject(new Error('Server Error. Cannot stop server that is not running.'));
    server.http.close(() => {
      console.log(`shutting down server`)
      server.isOn = false; //INCOMPLETE
      mongoose.disconnect(MONGODB_URI);
      return resolve(server);
    });
  });
};
