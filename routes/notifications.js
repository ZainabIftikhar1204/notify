const express = require('express');
const {
  listAllNotifications,
  createNotification,
  updateNotification,
  previewNotificationMessage,
} = require('../controllers/notification');
const errorHandler = require('../middleware/error');
const {
  validateNotification,
  validateUpdateNotification,
} = require('../middleware/validation');

const router = express.Router();
router.use(errorHandler);

router.get('/', listAllNotifications);
router.post('/', validateNotification, createNotification);
router.patch('/:id', validateUpdateNotification, updateNotification);
router.post('/:id/message', previewNotificationMessage);

module.exports = router;
