const Joi = require('joi');
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
  applicationId: {
    type: mongoose.Schema.Types.ObjectId, // Change to mongoose.Schema.Types.ObjectId
    ref: 'Application', // Add a reference to the 'Application' model
    required: true,
  },
});

const Event = mongoose.model('Event', eventSchema);

function validateEvent(event) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().min(5).required(),
    tags: Joi.array(),
  });
  return schema.validate(event);
}

function validateUpdateEvent(event) {
  const schema = Joi.object({
    name: Joi.string().min(3),
    description: Joi.string().min(5),
  });
  return schema.validate(event);
}

exports.eventSchema = eventSchema;
exports.Event = Event;
exports.validate = validateEvent;
exports.validateEventUpdate = validateUpdateEvent;

// exports.validateUpdateEvent = validateUpdateEvent;
