const express = require('express');
const {
  listAllNotifications,
  createNotification,
  updateNotification,
} = require('../controllers/notification');

const router = express.Router();
router.get('/', listAllNotifications);
router.post('/', createNotification);
router.patch('/:id', updateNotification);
// router.post('/message',previewNotificationMessage);

module.exports = router;
