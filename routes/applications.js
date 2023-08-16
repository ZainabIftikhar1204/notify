const express = require('express');
const {
  listAllApplications,
  createApplication,
  updateApplication,
  listApplication,
} = require('../controllers/application');

const router = express.Router();
router.get('/', listAllApplications);
router.post('/', createApplication);
router.patch('/:id', updateApplication);
router.get('/:id', listApplication);

module.exports = router;
