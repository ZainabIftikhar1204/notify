const Joi = require('joi');
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  description: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
});

const Application = mongoose.model('Application', applicationSchema);

function validateApp(app) {
  const schema = {
    name: Joi.string().min(3).required(),
    description: Joi.string().min(5).required(),
    is_deleted: Joi.boolean().default(false),
  };
  return Joi.validate(app, schema);
}

exports.applicationSchema = applicationSchema;
exports.Application = Application;
exports.validate = validateApp;
