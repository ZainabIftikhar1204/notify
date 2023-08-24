const httpStatus = require('http-status-codes');
const logger = require('../startup/logger');

// eslint-disable-next-line no-unused-vars
module.exports = function (err, req, res, next) {
  // logger.error(err.message, { traceid: req.header('X-Trace-ID') }); // Assuming you set traceid in the request header
  logger.error(err.message, err);
  res.status(httpStatus.StatusCodes.BAD_REQUEST).json({
    error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.BAD_REQUEST),
  });
};
