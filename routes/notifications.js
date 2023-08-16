const express = require('express');
const {
  listAllNotifications,
  createNotification,
} = require('../controllers/notification');

const router = express.Router();
router.get('/', listAllNotifications);
router.post('/', createNotification);

module.exports = router;
