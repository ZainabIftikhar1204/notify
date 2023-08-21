const express = require('express');
const {
  createEvent,
  updateEvent,
  listAllEvents,
} = require('../controllers/event');
const {
  pgCreateEvent,
  pgListAllEvents,
  pgUpdateEvent,
} = require('../controllers/eventpg');

const errorHandler = require('../middleware/error');
const {
  validateEvent,
  validateUpdateEvent,
} = require('../middleware/validation');

const router = express.Router();
router.use(errorHandler);

// router.get('/', listAllEvents);
// router.post('/', validateEvent, createEvent);
// router.patch('/:id', validateUpdateEvent, updateEvent);

router.get('/', pgListAllEvents);
router.post('/', validateEvent, pgCreateEvent);
router.patch('/:id', validateUpdateEvent, pgUpdateEvent);

module.exports = router;
