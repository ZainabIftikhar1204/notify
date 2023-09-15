const _ = require('lodash');
const bcrypt = require('bcrypt');
const { ReasonPhrases, StatusCodes } = require('http-status-codes');
const { Users } = require('../../models/user');
const generateAuthToken = require('../../utils/auth');

async function loginUser(req, res) {
  const newUser = _.pick(req.body, ['email', 'name', 'password']);
  const user = await Users.findOne({ email: newUser.email });
  //   user = user[0];
  if (user) {
    const validPassword = await bcrypt.compare(newUser.password, user.password);
    if (!validPassword)
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: 'Invalid email or password',
        reason: ReasonPhrases.BAD_REQUEST,
      });
    const token = generateAuthToken(user);
    return res.status(StatusCodes.OK).send(token);
  }
  return res.status(StatusCodes.BAD_REQUEST).send({
    message: 'Invalid email or password',
    reason: ReasonPhrases.BAD_REQUEST,
  });
}

exports.loginUser = loginUser;
