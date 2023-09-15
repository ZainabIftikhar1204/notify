const express = require('express');
const config = require('config');

const dbConfig = config.get('database');
// eslint-disable-next-line import/no-dynamic-require
const { loginUser } = require(`../controllers/${dbConfig.dbName}/auth`);
const { validateAuth } = require('../middleware/validation');

const router = express.Router();

router.post('/login', validateAuth, loginUser);

module.exports = router;
