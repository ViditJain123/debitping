// Diagnostic script for WhatsApp messaging
require('dotenv').config(); // Load environment variables from .env file if present

// Check environment variables
console.log('ENVIRONMENT VARIABLES CHECK:');
console.log('---------------------------');
console.log(`TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✓ Set' : '✗ Not set'}`);
console.log(`TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✓ Set' : '✗ Not set'}`);
console.log(`TWILIO_WHATSAPP_NUMBER: ${process.env.TWILIO_WHATSAPP_NUMBER ? '✓ Set' : '✗ Not set'}`);

// Display the phone number values (partially masked for security)
if (process.env.TWILIO_ACCOUNT_SID) {
  const maskedSid = process.env.TWILIO_ACCOUNT_SID.substring(0, 6) + '...' + 
                   process.env.TWILIO_ACCOUNT_SID.substring(process.env.TWILIO_ACCOUNT_SID.length - 4);
  console.log(`Account SID: ${maskedSid}`);
}

if (process.env.TWILIO_WHATSAPP_NUMBER) {
  console.log(`WhatsApp Number: ${process.env.TWILIO_WHATSAPP_NUMBER}`);
  
  // Check if WhatsApp number has correct prefix
  if (!process.env.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')) {
    console.log('⚠️ WARNING: WhatsApp number should be prefixed with "whatsapp:"');
    console.log(`Correct format would be: whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`);
  }
}

console.log('\nWHATSAPP MESSAGE DEBUGGING:');
console.log('-------------------------');
console.log('Common Issues:');
console.log('1. SANDBOX RESTRICTIONS: Recipients must opt-in by sending a message');
console.log('   - Send "join <sandbox-code>" to +14155238886 from your WhatsApp');
console.log('2. MESSAGE TEMPLATE RESTRICTIONS: In sandbox, only pre-approved messages work');
console.log('3. 24-HOUR WINDOW: You can only send non-template messages within 24 hours of receiving a message');

// If provided with a phone number, test formatting it
const testNumber = process.argv[2];
if (testNumber) {
  console.log('\nPHONE NUMBER FORMAT TEST:');
  console.log('-----------------------');
  console.log(`Original Number: ${testNumber}`);
  
  // Strip non-numeric characters except +
  const cleaned = testNumber.replace(/[^\d+]/g, '');
  console.log(`Cleaned Number: ${cleaned}`);
  
  // Ensure + prefix
  const withPrefix = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  console.log(`With + Prefix: ${withPrefix}`);
  
  // Add WhatsApp prefix
  const whatsappFormatted = `whatsapp:${withPrefix}`;
  console.log(`WhatsApp Formatted: ${whatsappFormatted}`);
  
  // EXPLAIN NEXT STEPS
  console.log('\nNEXT STEPS:');
  console.log('-----------');
  console.log('1. On your phone, send "join <sandbox-code>" to +14155238886 via WhatsApp');
  console.log('2. Run your test script after joining the sandbox:');
  console.log('   node test-whatsapp.js +919646711228');
}
