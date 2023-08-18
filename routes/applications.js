const express = require('express');
const {
  listAllApplications,
  createApplication,
  updateApplication,
  listApplication,
} = require('../controllers/application');

const errorHandler = require('../middleware/error');
const { validateApp, validateUpdateApp } = require('../middleware/validation');

const router = express.Router();

router.use(errorHandler);

router.get('/', listAllApplications);
router.post('/', validateApp, createApplication);
router.patch('/:id', validateUpdateApp, updateApplication);
router.get('/:id', listApplication);

module.exports = router;
