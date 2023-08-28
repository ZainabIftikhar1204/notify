const winston = require('winston');

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'verbose',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, traceid }) => {
      if (!traceid) {
        return `[${timestamp}] [${level}] ${message}`;
      }
      return `[${timestamp}] [${level}] [${traceid}]: ${message}`;
    }),
  ),
  transports: [
    new winston.transports.File({ filename: 'logfile.log' }), // Log to a file
    new winston.transports.Console(), // Log to the console
  ],
});

module.exports = logger;
