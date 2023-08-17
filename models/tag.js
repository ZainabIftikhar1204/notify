const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30,
  },
});

const Tag = mongoose.model('Tag', tagSchema);

exports.Tag = Tag;
