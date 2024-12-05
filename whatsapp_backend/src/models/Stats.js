// src/models/Stats.js
const statsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  messagesSent: {
    type: Number,
    default: 0
  },
  messagesDelivered: {
    type: Number,
    default: 0
  },
  messagesRead: {
    type: Number,
    default: 0
  },
  messagesFailed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for date-based queries
statsSchema.index({ userId: 1, date: -1 });