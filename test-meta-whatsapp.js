// Test script for Meta WhatsApp Business API
const axios = require('axios');

// Get your Meta access token from environment variables
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAARiuQSLDBkBO54O5IguALebtrK9wopZAD1QReqyoBszpdQELoez2UsZBbFF9dWtEiwW5ZAUjh0ZAv7OZBvAHEnqAps5jPHRwBYdobbO1eP9GrMCg5DauFJ4wWRw4SbGV0enuqFqtG9ZBMDpoKbUrYmWapWGTsXxEiWa5GfYh7G3bGK6RyjJRItFWjNBgXQhXgp5HlrWdTzeA0Lpo862hvlRqU0tVmwXCN9QYZD';

// You'll need your phone number ID from your Meta WhatsApp Business account
// This is NOT your regular phone number - it's a specific ID assigned by Meta
const PHONE_NUMBER_ID = 'YOUR_PHONE_NUMBER_ID'; // You need to get this from the Meta developer portal

async function sendWhatsAppMessage(to, message) {
  try {
    // Remove any non-numeric characters except the + sign
    const cleanedTo = to.replace(/[^\d+]/g, '');
    
    console.log(`Sending WhatsApp message via Meta API to ${cleanedTo}`);
    
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanedTo,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      }
    });
    
    console.log('Message sent successfully via Meta API:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message via Meta API:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
  }
}

// Get the phone number from command line argument
const testPhoneNumber = process.argv[2];

if (!testPhoneNumber) {
  console.log('Please provide a phone number as an argument:');
  console.log('node test-meta-whatsapp.js +1234567890');
} else {
  console.log('Testing WhatsApp messaging with Meta API');
  console.log('------------------------------------');
  console.log(`To: ${testPhoneNumber}`);
  console.log('------------------------------------\n');
  
  // Send a test message
  sendWhatsAppMessage(
    testPhoneNumber, 
    'Hello! This is a test message from your WhatsApp automation app using the Meta API.'
  );
}
