// src/services/whatsappService.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const EventEmitter = require('events');
const path = require('path');
const fs = require('fs-extra');

class WhatsAppService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map();
    this.sessionsPath = path.join(process.cwd(), '.wwebjs_auth');
  }

  // Add static initialize method
  static initialize() {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  async initializeClient(userId) {
    try {
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: userId.toString(),
          dataPath: this.sessionsPath
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
          ]
        },
        restartOnAuthFail: true
      });

      await client.initialize();
      this.clients.set(userId.toString(), client);
      return client;
    } catch (error) {
      console.error('Failed to initialize client:', error);
      throw error;
    }
  }

  async getOrCreateClient(userId) {
    let client = this.clients.get(userId.toString());
    
    if (!client) {
      const session = await WhatsAppSession.findOne({ userId });
      
      if (session?.sessionState === 'CONNECTED') {
        // Restore existing session
        client = await this.initializeClient(userId);
      } else {
        // Create new session
        client = await this.initializeClient(userId);
      }
    }
    
    return client;
  }

  async logout(userId) {
    const client = this.clients.get(userId.toString());
    if (client) {
      // Only close the client connection but keep session data
      await client.destroy();
      this.clients.delete(userId.toString());
      
      await WhatsAppSession.findOneAndUpdate(
        { userId },
        {
          sessionState: 'DISCONNECTED',
          lastActivity: new Date()
        }
      );
    }
  }

  async restoreSession(userId) {
    try {
      const session = await WhatsAppSession.findOne({ userId });
      if (session?.sessionData) {
        const client = await this.getOrCreateClient(userId);
        return client;
      }
      return null;
    } catch (error) {
      console.error(`Failed to restore session for user ${userId}:`, error);
      return null;
    }
  }
}

// Export singleton instance
module.exports = WhatsAppService.initialize();