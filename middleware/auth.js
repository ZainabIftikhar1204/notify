const jwt = require('jsonwebtoken');
const config = require('config');
const debug = require('debug')('app:middleware');
const { ReasonPhrases, StatusCodes } = require('http-status-codes');

function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token)
    return res.status(StatusCodes.UNAUTHORIZED).send({
      message: 'Access Denied. No Token Provided.',
      reason: ReasonPhrases.UNAUTHORIZED,
    });
  const secretKey = config.get('SECRET_KEY');
  try {
    const decodedPayload = jwt.verify(token, secretKey);
    debug('decodedPayload:', decodedPayload);
    req.user = decodedPayload;
    next();
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: 'Invalid token', reason: ReasonPhrases.BAD_REQUEST });
  }
}

module.exports = auth;
