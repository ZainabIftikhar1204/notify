// eslint-disable-next-line import/no-extraneous-dependencies
require('express-async-errors');
const express = require('express');
const config = require('config');

const app = express();

const logger = require('./startup/logger');

const dbConfig = config.get('database');

// eslint-disable-next-line import/no-dynamic-require
require(`./startup/${dbConfig.dbName}/db`)();
require('./startup/routes')(app);

const port = config.get('server.port') || 3000;
const server = app.listen(port, () =>
  logger.info(`Listening on port ${port}...`),
);

module.exports = server;
