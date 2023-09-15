const jwt = require('jsonwebtoken');
const configuration = require('config');

function generateAuthToken(user) {
  const secretKey = configuration.get('SECRET_KEY');
  const token = jwt.sign({ id: user.id, name: user.name }, secretKey);
  return token;
}

module.exports = generateAuthToken;
