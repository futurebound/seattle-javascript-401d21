'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

//to set up CRUD methods on exported uploads object
const uploads = module.exports = {};

uploads.uploadProm = function(params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => err ? reject(err) : resolve(data))
  })
}