const debug = require('debug')('app:routes');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { ReasonPhrases, StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const { Users } = require('../../models/user');
const generateAuthToken = require('../../utils/auth');

const { ObjectId } = mongoose.Types;

async function registerUser(req, res) {
  const newUser = _.pick(req.body, ['email', 'name', 'password']);

  const user = await Users.find({ email: newUser.email });
  if (user.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUser.password, salt);
    newUser.password = hashedPassword;
    debug('user: ', newUser);
    const createdUser = await Users.create(newUser);

    debug(' createdUser:', createdUser);
    const resUser = _.pick(createdUser, ['email', 'name', '_id']);
    debug('🚀 ~ file: userController.js:24 ~ registerUser ~ resUser:', resUser);
    const token = generateAuthToken(resUser);

    return res.header('x-auth-token', token).send(resUser);
  }
  return res.status(StatusCodes.CONFLICT).send({
    message: 'This user already exists',
    reason: ReasonPhrases.CONFLICT,
  });
}

async function getCurrentUser(req, res) {
  debug('req.user:', req.user.id);
  const requiredUserId = new ObjectId(req.user.id);
  const user = await Users.find({ _id: requiredUserId });
  debug('🚀 ~ file: userController.js:39 ~ getCurrentUser ~ user:', user);
  // dont send password
  const resUser = _.pick(user[0], [
    'email',
    'name',
    '_id',
    'created_at',
    'created_by',
    'modified_at',
    'modified_by',
    'is_active',
  ]);
  res.status(StatusCodes.OK).send(resUser);
}

module.exports.registerUser = registerUser;
module.exports.getCurrentUser = getCurrentUser;
