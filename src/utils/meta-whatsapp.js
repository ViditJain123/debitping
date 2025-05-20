import fetch from 'node-fetch';

/**
 * Utility for sending WhatsApp messages via Meta WhatsApp Business API
 */
export class MetaWhatsAppService {
  constructor(token, phoneNumberId, version = 'v16.0') {
    this.token = token;
    this.phoneNumberId = phoneNumberId;
    this.apiVersion = version;
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
  }

  /**
   * Send a text message via WhatsApp
   * @param {string} to - Recipient's phone number in E.164 format
   * @param {string} text - Message content
   * @returns {Promise<Object>} API response
   */
  async sendTextMessage(to, text) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { body: text }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Send a template message via WhatsApp
   * @param {string} to - Recipient's phone number in E.164 format
   * @param {string} templateName - Name of the template to use
   * @param {Array} components - Template components (header, body, buttons)
   * @param {string} language - Template language code (default: en_US)
   * @returns {Promise<Object>} API response
   */
  async sendTemplateMessage(to, templateName, components = [], language = 'en_US') {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: language
            },
            components
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp template message:', error);
      throw error;
    }
  }
}

// Export functions for direct usage
export async function sendWhatsAppMessage(to, text) {
  return metaWhatsAppService.sendTextMessage(to, text);
}

export async function logMetaMessageSent(dealerId, messageContent, messageId, userId) {
  try {
    // Import here to avoid circular dependencies
    const { db } = await import('./db.js');
    
    await db.message.create({
      data: {
        content: messageContent,
        providerId: messageId,
        provider: 'meta',
        userId: userId,
        dealerId: dealerId,
        status: 'sent',
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error logging Meta WhatsApp message:', error);
    // Don't throw error to avoid breaking the message flow
  }
}

// Create a singleton instance with default empty values
// These should be replaced with actual values from environment variables in the application
const metaWhatsAppService = new MetaWhatsAppService(
  process.env.META_WHATSAPP_TOKEN || '',
  process.env.META_WHATSAPP_PHONE_NUMBER_ID || ''
);

export default metaWhatsAppService;
