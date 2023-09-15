const mongoose = require('mongoose');
const Joi = require('joi');
const { isEmail } = require('validator');

function emailValidator(value) {
  return isEmail(value);
}

const authSchema = new mongoose.Schema({
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

const Auth = mongoose.model('Auth', authSchema);

const requestAuthSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  created_at: Joi.date().default(new Date(Date.now())),
  modified_at: Joi.date().default(new Date(Date.now())),
  created_by: Joi.string().optional(),
  modified_by: Joi.string().optional(),
  is_active: Joi.boolean().default(true).optional(),
});

module.exports.Auth = Auth;
exports.authSchema = requestAuthSchema;
