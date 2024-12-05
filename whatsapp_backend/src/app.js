// src/app.js
const express = require('express');
const app = express();
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(compression());
app.use(helmet());

// Cache control
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;