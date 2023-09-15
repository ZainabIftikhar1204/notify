const express = require('express');
const config = require('config');

const dbConfig = config.get('database');
const {
  registerUser,
  getCurrentUser,
  // eslint-disable-next-line import/no-dynamic-require
} = require(`../controllers/${dbConfig.dbName}/user`);
const { validateUser } = require('../middleware/validation');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/me', auth, getCurrentUser);
// register a new user
router.post('/register', validateUser, registerUser);

module.exports = router;
