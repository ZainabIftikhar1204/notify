const express = require('express');
const applications = require('../routes/applications');
const events = require('../routes/events');
const notifications = require('../routes/notifications');
const error = require('../middleware/error');
const traceIdMiddleware = require('../middleware/traceIdMiddleware'); // Add the path to your middleware
const auth = require('../routes/auth');
const user = require('../routes/user');

module.exports = function (app) {
  app.use(express.json());
  app.use(traceIdMiddleware);

  app.use('/api/applications', applications);
  app.use('/api/events', events);
  app.use('/api/notifications', notifications);
  app.use('/api/auth', auth);
  app.use('/api/users', user);
  app.use(error);
};
