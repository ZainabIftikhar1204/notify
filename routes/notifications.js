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

const {
  validateNotification,
  validateUpdateNotification,
  validateMessage,
} = require('../middleware/validation');

const { getNotificationFilters } = require('../middleware/queryValidation');

const router = express.Router();

router.get('/', getNotificationFilters, listAllNotifications);
router.post('/', validateNotification, createNotification);
router.patch('/:id', validateUpdateNotification, updateNotification);
router.post('/:id/message', validateMessage, previewNotificationMessage);

module.exports = router;
