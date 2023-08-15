/* eslint-disable import/no-extraneous-dependencies */
const winston = require('winston');
const mongoose = require('mongoose');

// eslint-disable-next-line func-names
module.exports = function () {
  mongoose
    .connect('mongodb://localhost:27017/notify', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => winston.info('Connected to MongoDB...'))
    .catch((error) => {
      winston.error('Error connecting to MongoDB:', error);
    });
};
