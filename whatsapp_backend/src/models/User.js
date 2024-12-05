// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  expiryDate: {
    type: Date,
    set: function(val) {
      if (!val) return null;
      const d = new Date(val);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    },
    get: function(val) {
      return val ? val.toISOString() : null;
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  companyName: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true,
  toObject: { getters: true },
  toJSON: { getters: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Add pre-save middleware to handle dates
userSchema.pre('save', function(next) {
  if (this.isModified('expiryDate') && this.expiryDate) {
    const d = new Date(this.expiryDate);
    d.setUTCHours(0, 0, 0, 0);
    this.expiryDate = d;
  }
  next();
});

// Add middleware to check expiry and set suspension
userSchema.pre('save', function(next) {
  if (this.expiryDate) {
    const now = new Date();
    if (this.expiryDate < now) {
      this.isSuspended = true;
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Ensure this.password exists since we used select: false
    if (!this.password) {
      throw new Error('Password not loaded');
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);