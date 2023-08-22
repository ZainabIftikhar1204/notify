const express = require('express');
const config = require('config');

const dbConfig = config.get('database');

const {
  createEvent,
  updateEvent,
  listAllEvents,
  // eslint-disable-next-line import/no-dynamic-require
} = require(`../controllers/${dbConfig.dbName}/event`);

const errorHandler = require('../middleware/error');
const {
  validateEvent,
  validateUpdateEvent,
} = require('../middleware/validation');

const router = express.Router();
router.use(errorHandler);

router.get('/', listAllEvents);
router.post('/', validateEvent, createEvent);
router.patch('/:id', validateUpdateEvent, updateEvent);

module.exports = router;
