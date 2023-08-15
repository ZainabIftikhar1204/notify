const express = require('express');
const applications = require('../routes/applications');
const error = require('../middleware/error');

// eslint-disable-next-line func-names
module.exports = function (app) {
  app.use(express.json());
  app.use('/api/applications', applications);
  // app.use('/api/auth', auth);
  app.use(error);
};
