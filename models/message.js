const Joi = require('joi');
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  body: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 250,
  },
  notificationId: {
    type: mongoose.Schema.Types.ObjectId, // Change to mongoose.Schema.Types.ObjectId
    ref: 'Notification', // Add a reference to the 'Application' model
    required: true,
  },
});

const Message = mongoose.model('Message', messageSchema);

function validateMessage(event) {
  const schema = Joi.object({
    email: Joi.email().min(3).required(),
    body: Joi.string().min(10).max(250).required(),
  });
  return schema.validate(event);
}

exports.Message = Message;
exports.validate = validateMessage;
