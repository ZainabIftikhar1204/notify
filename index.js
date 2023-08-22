// eslint-disable-next-line import/no-extraneous-dependencies
const winston = require('winston');
const express = require('express');
const config = require('config');

const app = express();
const dbConfig = config.get('database');

// eslint-disable-next-line import/no-dynamic-require
require(`./startup/${dbConfig.dbName}/db`)();
require('./startup/routes')(app);

const port = process.env.PORT || 3000;
app.listen(port, () => winston.info(`Listening on port ${port}...`));
