// src/models/WhatsAppSession.js
const mongoose = require('mongoose');

const whatsAppSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  sessionState: {
    type: String,
    enum: ['DISCONNECTED', 'CONNECTED', 'AWAITING_QR'],
    default: 'DISCONNECTED',
    index: true
  },
  sessionData: {
    type: Object,
    required: false
  },
  whatsappId: String,
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('WhatsAppSession', whatsAppSessionSchema);