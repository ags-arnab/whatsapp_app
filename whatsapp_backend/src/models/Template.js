// src/models/Template.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for user's templates
  },
  title: {
    type: String,
    required: true,
    index: true // Index for title search
  },
  message: String,
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for template search
templateSchema.index({ userId: 1, title: 1 });

module.exports = mongoose.model('Template', templateSchema);