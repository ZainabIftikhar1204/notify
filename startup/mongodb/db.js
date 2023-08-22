/* eslint-disable import/no-extraneous-dependencies */
const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

const dbConfig = config.get('database.mongodb');

// eslint-disable-next-line func-names
module.exports = function () {
  mongoose
    .connect(`${dbConfig.connectionString}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => winston.info('Connected to MongoDB...'))
    .catch((error) => {
      winston.error('Error connecting to MongoDB:', error);
    });
};
