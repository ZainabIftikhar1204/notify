const mongoose = require('mongoose');
const Joi = require('joi');
const { isEmail } = require('validator');
const generateAuthToken = require('../utils/auth');

function emailValidator(value) {
  return isEmail(value);
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, min: 3, max: 255 },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    validate: emailValidator,
  },
  password: { type: String, required: true, min: 8, max: 1000 },
  created_at: { type: Date, default: new Date() },
  modified_at: { type: Date, default: new Date() },
  created_by: String,
  modified_by: String,
  is_active: { type: Boolean, default: true },
});

userSchema.methods.generateAuthToken = generateAuthToken;

const Users = mongoose.model('Users', userSchema);

const requestUserSchema = Joi.object().keys({
  name: Joi.string().required().min(3).max(255),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8).max(1000),
  created_at: Joi.date().default(new Date(Date.now())),
  modified_at: Joi.date().default(new Date(Date.now())),
  created_by: Joi.string().optional(),
  modified_by: Joi.string().optional(),
  is_active: Joi.boolean().default(true).optional(),
});

module.exports.Users = Users;
exports.userSchema = requestUserSchema;
