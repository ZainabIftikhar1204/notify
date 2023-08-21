const express = require('express');
const {
  listAllApplications,
  createApplication,
  updateApplication,
  listApplication,
} = require('../controllers/application');

const {
  pgListAllApplications,
  pgCreateApplication,
  pgUpdateApplication,
  pgListApplication,
} = require('../controllers/applicationpg');

const errorHandler = require('../middleware/error');
// const { validateApp, validateUpdateApp } = require('../middleware/validation');

const router = express.Router();

router.use(errorHandler);

router.get('/', pgListAllApplications);
router.post('/', pgCreateApplication);
router.patch('/:id', pgUpdateApplication);
router.get('/:id', pgListApplication);

// Roues for Monggose
// router.get('/', listAllApplications);
// router.post('/', validateApp, createApplication);
// router.patch('/:id', validateUpdateApp, updateApplication);
// router.get('/:id', listApplication);

module.exports = router;
