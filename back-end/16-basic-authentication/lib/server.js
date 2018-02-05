'use strict';

//app dependencies
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const errorHandler = require('./error-handler');

//app setup
const app = express();
const router = express.Router();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;