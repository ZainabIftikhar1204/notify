const express = require('express');
const {
  listAllNotifications,
  createNotification,
  updateNotification,
  previewNotificationMessage,
} = require('../controllers/notification');
const {
  pglistAllNotifications,
  pgCreateNotification,
  pgUpdateNotification,
  pgPreviewNotificationMessage,
} = require('../controllers/notificationpg');

const errorHandler = require('../middleware/error');
const {
  validateNotification,
  validateUpdateNotification,
} = require('../middleware/validation');

const router = express.Router();
router.use(errorHandler);

router.get('/', pglistAllNotifications);
router.post('/', validateNotification, pgCreateNotification);
router.patch('/:id', validateUpdateNotification, pgUpdateNotification);
router.post('/:id/message', pgPreviewNotificationMessage);

// router.get('/', listAllNotifications);
// router.post('/', validateNotification, createNotification);
// router.patch('/:id', validateUpdateNotification, updateNotification);
// router.post('/:id/message', previewNotificationMessage);

module.exports = router;
