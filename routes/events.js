const express = require('express');
const {
  createEvent,
  updateEvent,
  listAllEvents,
} = require('../controllers/event');

const router = express.Router();
router.get('/', listAllEvents);
router.post('/', createEvent);
router.patch('/:id', updateEvent);

module.exports = router;
