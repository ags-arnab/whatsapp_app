// src/models/MessageHistory.js
const mongoose = require('mongoose');

const messageHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for user's messages
  },
  messageId: {
    type: String,
    required: true,
    index: true // Index for message lookup
  },
  to: {
    type: String,
    required: true,
    index: true // Index for recipient lookup
  },
  content: String,
  mediaUrl: String,
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
    default: 'queued',
    index: true // Index for status filtering
  },
  errorType: String,
  deliveredAt: Date,
  readAt: Date
}, {
  timestamps: true
});

// Compound indexes for common queries
messageHistorySchema.index({ userId: 1, status: 1, createdAt: -1 });
messageHistorySchema.index({ to: 1, createdAt: -1 });

module.exports = mongoose.model('MessageHistory', messageHistorySchema);