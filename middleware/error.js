const httpStatus = require('http-status-codes');
const logger = require('../startup/logger');

// eslint-disable-next-line no-unused-vars
module.exports = function (err, req, res, next) {
  // Log the error using the logger
  logger.error(err.message, { traceid: req.traceId });

  // Respond with an error status and message
  res.status(httpStatus.StatusCodes.BAD_REQUEST).json({
    error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.BAD_REQUEST),
  });
};
