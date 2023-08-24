const express = require('express');
const config = require('config');

const dbConfig = config.get('database');
const {
  listAllApplications,
  createApplication,
  updateApplication,
  listApplication,
  // eslint-disable-next-line import/no-dynamic-require
} = require(`../controllers/${dbConfig.dbName}/application`);

const { getAppFilters } = require('../middleware/queryValidation');

const errorHandler = require('../middleware/error');
const { validateApp, validateUpdateApp } = require('../middleware/validation');

const router = express.Router();

router.get('/', getAppFilters, listAllApplications);
router.post('/', validateApp, createApplication);
router.patch('/:id', validateUpdateApp, updateApplication);
router.get('/:id', listApplication);

router.use(errorHandler);

module.exports = router;
