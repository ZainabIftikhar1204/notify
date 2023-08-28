// eslint-disable-next-line import/no-extraneous-dependencies
const uuid = require('uuid');
const logger = require('../startup/logger');

module.exports = function (req, res, next) {
  const traceId = req.header('X-Trace-ID') || uuid.v4();

  if (!req.header('X-Trace-ID')) {
    req.headers['X-Trace-ID'] = traceId; // Set trace ID in request header
  }

  if (!res.getHeader('X-Trace-ID')) {
    res.setHeader('X-Trace-ID', traceId); // Set trace ID in response header
  }
  logger.info(` ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`, {
    traceid: traceId,
  });
  req.traceId = traceId;
  next();
};
