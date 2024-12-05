// src/controllers/whatsappController.js
const WhatsAppService = require('../services/whatsappService');
const MessageHistory = require('../models/MessageHistory');
const { validationResult } = require('express-validator');

exports.getStatus = async (req, res) => {
  try {
    const status = WhatsAppService.getStatus();
    // Add system metrics
    const metrics = {
      cpu: 45, // Add actual CPU monitoring
      memory: 60, // Add actual memory monitoring
      uptime: '48.5 hrs',
      storage: '2.4 GB'
    };
    res.json({ ...status, metrics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
};

exports.getQR = async (req, res) => {
  try {
    const qr = await WhatsAppService.getQR();
    if (!qr) return res.status(404).json({ error: 'QR not available' });
    res.json({ qr });
  } catch (error) {
    res.status(500).json({ error: 'QR generation failed' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { to, message, media } = req.body;
    const result = await WhatsAppService.sendMessage(to, message, media);
    
    const messageHistory = await MessageHistory.create({
      userId: req.user._id,
      messageId: result.id,
      to,
      content: message,
      mediaUrl: media?.url,
      status: 'sent'
    });

    res.json({ 
      success: true, 
      messageId: result.id,
      message: messageHistory 
    });
  } catch (error) {
    res.status(500).json({ error: 'Message sending failed' });
  }
};

exports.getMessageHistory = async (req, res) => {
  try {
    const messages = await MessageHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch message history' });
  }
};

exports.getInvalidNumbers = async (req, res) => {
  try {
    const invalidNumbers = await MessageHistory.find({ 
      status: 'failed',
      errorType: 'INVALID_NUMBER' 
    });
    res.json(invalidNumbers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invalid numbers' });
  }
};

exports.getInactiveNumbers = async (req, res) => {
  try {
    // Get numbers with no activity in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const inactiveNumbers = await MessageHistory.distinct('to', {
      createdAt: { $lt: thirtyDaysAgo }
    });
    res.json(inactiveNumbers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inactive numbers' });
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ userId: req.user._id });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { title, message } = req.body;
    const template = await Template.create({
      userId: req.user._id,
      title,
      message
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create template' });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { title, message } = req.body;
    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, message },
      { new: true }
    );
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update template' });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

exports.processFile = async (req, res) => {
  try {
    const file = req.files.file;
    const result = await WhatsAppService.processExcelFile(file);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process file' });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const metrics = await WhatsAppService.getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

exports.initializeSession = async (req, res) => {
  try {
    const userId = req.user._id;
    await WhatsAppService.getClient(userId);
    res.json({ message: 'WhatsApp session initialization started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize WhatsApp session' });
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user._id;
    await WhatsAppService.logout(userId);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' });
  }
};