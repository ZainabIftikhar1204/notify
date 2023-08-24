const winston = require('winston');

// const logger = winston.createLogger({
//   level: process.env.NODE_ENV === 'production' ? 'info' : 'verbose',
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.printf(
//       ({ timestamp, level, message }) =>
//         `[${timestamp}] [${level}] [${winston
//           .getFormat()
//           .transform('traceid')}]: ${message}`,
//     ),
//   ),
//   transports: [
//     new winston.transports.File({ filename: 'logfile.log' }), // Log to a file
//     // Add more transports if needed (e.g., log to a file)
//   ],
// });

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'verbose',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] [${level}] ${message}`,
    ),
  ),
  transports: [
    new winston.transports.File({ filename: 'logfile.log' }), // Log to a file
    // Add more transports if needed (e.g., log to a file)
  ],
});

module.exports = logger;
