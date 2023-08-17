const express = require('express');
const {
  listAllNotifications,
  createNotification,
  updateNotification,
  previewNotificationMessage,
} = require('../controllers/notification');

const router = express.Router();
router.get('/', listAllNotifications);
router.post('/', createNotification);
router.patch('/:id', updateNotification);
router.post('/:id/message', previewNotificationMessage);

module.exports = router;
