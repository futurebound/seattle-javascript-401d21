'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

//to set up CRUD methods on exported uploads object
const uploads = module.exports = {};

//config of requiring in AWS-SDK automatically looks for AWS env variables, so don't need to explicitly configure here. COULD. but don't need to
uploads.uploadProm = function(params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => err ? reject(err) : resolve(data));
  });
};

uploads.deleteProm = function(params) {
  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => err ? reject(err) : resolve(data));
  });
};