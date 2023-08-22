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

const errorHandler = require('../middleware/error');
// const { validateApp, validateUpdateApp } = require('../middleware/validation');

const router = express.Router();

router.use(errorHandler);

router.get('/', listAllApplications);
router.post('/', createApplication);
router.patch('/:id', updateApplication);
router.get('/:id', listApplication);

// Roues for Monggose
// router.get('/', listAllApplications);
// router.post('/', validateApp, createApplication);
// router.patch('/:id', validateUpdateApp, updateApplication);
// router.get('/:id', listApplication);

module.exports = router;
