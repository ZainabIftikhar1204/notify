const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  // Other fields specific to your Tag model
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
