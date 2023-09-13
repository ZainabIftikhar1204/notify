const express = require('express');
const config = require('config');

const dbConfig = config.get('database');

const { listAllTags } = require('../controllers/mongodb/tags');

const router = express.Router();

router.get('/', listAllTags);

module.exports = router;
