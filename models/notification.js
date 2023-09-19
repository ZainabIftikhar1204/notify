const Joi = require('joi');
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 200,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId, // Change to mongoose.Schema.Types.ObjectId
    ref: 'Event', // Add a reference to the 'Application' model
    required: true,
  },
  templatesubject: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 50,
  },
  templatebody: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 250,
  },
  tags: [
    {
      label: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50,
      },
    },
  ],
  is_active: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: null,
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

function validateNotification(notification) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().min(5).required(),
    templatebody: Joi.string().min(10).max(250),
  });
  return schema.validate(notification);
}

// function validateUpdateEvent(event) {
//   const schema = Joi.object({
//     name: Joi.string().min(3),
//     description: Joi.string().min(5),
//     templatebody: Joi.string().min(10),
//   });
//   return schema.validate(event);
// }

exports.notificationSchema = notificationSchema;
exports.Notification = Notification;
exports.validate = validateNotification;
// exports.validateEventUpdate = validateUpdateEvent;
