// src/config/config.js
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp_manager',
  JWT_SECRET: process.env.JWT_SECRET || '7WbzPXjH9qNfK3mV5yT2dL8sR4cA6gE1',
  JWT_EXPIRE: '24h',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
};