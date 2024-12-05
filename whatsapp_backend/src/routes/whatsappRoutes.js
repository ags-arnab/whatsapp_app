// src/routes/whatsappRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const whatsappController = require('../controllers/whatsappController');
const { check } = require('express-validator');

router.use(protect);

router.get('/status', whatsappController.getStatus);
router.get('/qr', whatsappController.getQR);
router.post('/send', [
  check('to').notEmpty().withMessage('Recipient number is required'),
  check('message').notEmpty().withMessage('Message content is required'),
  validate
], whatsappController.sendMessage);
router.get('/messages', whatsappController.getMessageHistory);
router.get('/numbers/invalid', whatsappController.getInvalidNumbers);
router.get('/numbers/inactive', whatsappController.getInactiveNumbers);

// Templates
router.get('/templates', whatsappController.getTemplates);
router.post('/templates', whatsappController.createTemplate);
router.put('/templates/:id', whatsappController.updateTemplate);
router.delete('/templates/:id', whatsappController.deleteTemplate);

// File Processing
router.post('/process-file', whatsappController.processFile);

// Metrics
router.get('/metrics', whatsappController.getMetrics);

// Session Management
router.post('/session/initialize', whatsappController.initializeSession);
router.post('/session/logout', whatsappController.logout);

module.exports = router;