const express = require('express');
const applications = require('../routes/applications');
const events = require('../routes/events');
const notifications = require('../routes/notifications');
const error = require('../middleware/error');

module.exports = function (app) {
  app.use(express.json());
  app.use('/api/applications', applications);
  app.use('/api/events', events);
  app.use('/api/notifications', notifications);
  // app.use('/api/auth', auth);
  app.use(error);
};
