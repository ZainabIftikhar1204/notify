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
    minlength: 5,
    maxlength: 50,
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
  templatebody: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 100,
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
});

const Notification = mongoose.model('Notification', notificationSchema);

function validateNotification(event) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().min(5).required(),
  });
  return schema.validate(event);
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
