const mongoose = require('mongoose');
const config = require('config');
const logger = require('../logger');

const dbConfig = config.get('database.mongodb');

// eslint-disable-next-line func-names
module.exports = function () {
  mongoose
    .connect(`${dbConfig.connectionString}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => logger.info('Connected to MongoDB...'))
    .catch((error) => {
      logger.error('Error connecting to MongoDB:', error);
    });
};
