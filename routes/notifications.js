const express = require('express');
const config = require('config');

const dbConfig = config.get('database');

const {
  listAllNotifications,
  createNotification,
  updateNotification,
  previewNotificationMessage,
  // eslint-disable-next-line import/no-dynamic-require
} = require(`../controllers/${dbConfig.dbName}/notification`);

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
