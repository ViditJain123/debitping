// Twilio WhatsApp messaging utility functions

/**
 * Sends a WhatsApp message using Twilio
 * @param {string} to - Destination phone number (must be in E.164 format)
 * @param {string} body - Message body
 * @param {string} from - Optional sender WhatsApp number (defaults to env variable)
 * @returns {Promise} - Resolves with Twilio API response
 */
export async function sendWhatsAppMessage(to, body, from = null) {
  try {
    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = from || process.env.TWILIO_WHATSAPP_NUMBER;
    
    // Detailed validation of Twilio credentials
    if (!accountSid) {
      console.error('Error: Missing TWILIO_ACCOUNT_SID environment variable');
      throw new Error('Missing TWILIO_ACCOUNT_SID environment variable. Please check your .env.local file.');
    }
    
    if (!authToken) {
      console.error('Error: Missing TWILIO_AUTH_TOKEN environment variable');
      throw new Error('Missing TWILIO_AUTH_TOKEN environment variable. Please check your .env.local file.');
    }
    
    if (!fromNumber) {
      console.error('Error: Missing TWILIO_WHATSAPP_NUMBER environment variable');
      throw new Error('Missing TWILIO_WHATSAPP_NUMBER environment variable. Please check your .env.local file.');
    }
    
    // Validate Twilio account SID format (should start with "AC")
    if (!accountSid.startsWith('AC')) {
      console.warn('Warning: TWILIO_ACCOUNT_SID should start with "AC". Please double-check your Twilio credentials.');
    }
    
    // Format the destination number for WhatsApp if needed
    const formattedTo = formatPhoneNumberForWhatsApp(to);
    
    // Format the from number properly - handle both with and without whatsapp: prefix
    const formattedFrom = fromNumber.startsWith('whatsapp:') 
      ? fromNumber 
      : `whatsapp:${fromNumber.startsWith('+') ? fromNumber : '+' + fromNumber}`;
    
    // Initialize Twilio client
    const twilio = require('twilio')(accountSid, authToken);
    
    // Send the message
    const message = await twilio.messages.create({
      body,
      from: formattedFrom,
      to: formattedTo
    });
    
    console.log(`Message sent successfully: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    
    // Enhance error reporting with more details
    let enhancedError;
    
    if (error.code === 20003) {
      // Authentication Error
      enhancedError = new Error(`Authentication failed with Twilio: Please check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables. Error: ${error.message}`);
    } else if (error.code === 21211) {
      // Invalid 'To' phone number
      enhancedError = new Error(`Invalid 'To' phone number: ${to}. Error: ${error.message}`);
    } else if (error.code === 21606) {
      // From number not enabled for WhatsApp
      enhancedError = new Error(`The 'From' number ${fromNumber} is not enabled for WhatsApp. Make sure to add the 'whatsapp:' prefix. Error: ${error.message}`);
    } else if (error.code === 21608) {
      // Message out of local sending hours
      enhancedError = new Error(`Cannot send message outside of allowed sending hours. Error: ${error.message}`);
    } else {
      enhancedError = new Error(`Twilio error (${error.code || 'unknown'}): ${error.message}`);
    }
    
    enhancedError.originalError = error;
    enhancedError.twilioErrorCode = error.code;
    enhancedError.twilioMoreInfo = error.moreInfo;
    
    throw enhancedError;
  }
}

/**
 * Mock function for sending WhatsApp messages during development
 * @param {string} to - Destination phone number
 * @param {string} body - Message body
 * @param {string} from - Sender phone number 
 * @returns {Object} - Mock Twilio response
 */
function mockSendWhatsAppMessage(to, body, from) {
  const mockSid = 'SM' + [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  
  console.log('------ MOCK WHATSAPP MESSAGE ------');
  console.log(`FROM: ${from}`);
  console.log(`TO: ${to}`);
  console.log(`MESSAGE: ${body}`);
  console.log(`SID: ${mockSid}`);
  console.log('---------------------------------');
  
  return {
    sid: mockSid,
    status: 'sent',
    dateCreated: new Date().toISOString(),
    to,
    from,
    body
  };
}

/**
 * Format a phone number for WhatsApp messaging (E.164 format with whatsapp: prefix)
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Properly formatted number for WhatsApp API
 */
export function formatPhoneNumberForWhatsApp(phoneNumber) {
  if (!phoneNumber) {
    throw new Error('Phone number is required');
  }
  
  // Remove any non-numeric characters except the + sign
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure the number starts with + for E.164 format
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  // Add the WhatsApp prefix if it doesn't already have it
  const formattedNumber = cleaned.startsWith('whatsapp:') ? cleaned : `whatsapp:${cleaned}`;
  
  return formattedNumber;
}

/**
 * Creates a message for an outstanding payment reminder
 * @param {string} dealerName - The name of the dealer
 * @param {number} amount - The outstanding amount
 * @param {string} distributorName - The name of the distributor
 * @returns {string} - Formatted message text
 */
export function createOutstandingPaymentMessage(dealerName, amount, distributorName) {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount);
  
  return `Hey ${dealerName}, you have an outstanding amount of ${formattedAmount}. Kindly please pay it back as soon as possible. Thanks.\n~${distributorName}`;
}

/**
 * Validate a phone number for WhatsApp messaging capability
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - Whether the number appears valid for E.164 format
 */
export function isValidWhatsAppNumber(phoneNumber) {
  // Strip all non-numeric characters except + for validation
  const stripped = phoneNumber.replace(/[^\d+]/g, '');
  
  // Basic validation for E.164 format
  // Must be at least 10 digits (not counting the +)
  if (stripped.length < 10) {
    return false;
  }
  
  // The number should either have a + at the beginning or we'll add it later
  // Real validation would require actually checking with Twilio's API
  return true;
}

/**
 * Log message history to the database
 * @param {string} dealerId - The ID of the dealer
 * @param {string} message - The message sent
 * @param {string} messageId - The Twilio message ID
 * @param {string} distributorId - The distributor's ID
 * @returns {Promise} - Resolves when the message is logged
 */
export async function logMessageSent(dealerId, message, messageId, distributorId) {
  try {
    const { connectToDatabase } = require('./db');
    const Message = require('../schema/message').default;
    
    await connectToDatabase();
    
    const newMessage = new Message({
      dealerId,
      distributorClerkId: distributorId,
      messageContent: message,
      twilioMessageId: messageId,
      sentAt: new Date(),
      status: 'sent'
    });
    
    await newMessage.save();
    
    console.log(`Message logged to database: ${messageId}`);
    
    return {
      success: true,
      messageId,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error logging message to database:', error);
    // Don't throw an error here, just log it - we don't want to fail the
    // overall process just because logging failed
    return {
      success: false,
      error: error.message
    };
  }
}
