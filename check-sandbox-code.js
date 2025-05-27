// Script to check your Twilio WhatsApp sandbox code
const twilio = require('twilio');

// Get your credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC469394a0980a8203320458030583aa08';
const authToken = process.env.TWILIO_AUTH_TOKEN || '13b78e4dff7e4aeff05fc8eeee1f2df4';

async function getSandboxInfo() {
  try {
    // Create a Twilio client
    const client = twilio(accountSid, authToken);
    
    // Get WhatsApp sandbox information
    const sandbox = await client.messaging.services('MG').fetch();
    
    console.log('Your WhatsApp Sandbox Information:');
    console.log('--------------------------------');
    console.log(sandbox);
    
    return sandbox;
  } catch (error) {
    console.error('Error fetching WhatsApp sandbox information:', error);
    
    console.log('\nPlease follow these manual steps instead:');
    console.log('1. Log in to your Twilio Console: https://console.twilio.com/');
    console.log('2. Navigate to Messaging > Try it out > Send a WhatsApp message');
    console.log('3. You\'ll see your sandbox code on that page');
    console.log('4. Send "join <your-sandbox-code>" to +14155238886 from WhatsApp');
  }
}

console.log('Checking your Twilio WhatsApp sandbox code...\n');
getSandboxInfo();
