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
    minlength: 10,
    maxlength: 200,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: String,
    default: '',
  },
  updated_at: {
    type: String,
    default: '',
  },
});

const Application = mongoose.model('Application', applicationSchema);

exports.applicationSchema = applicationSchema;
exports.Application = Application;
