// Simple script to test WhatsApp messaging and check message status
const twilio = require('twilio');

// Get your credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC469394a0980a8203320458030583aa08';
const authToken = process.env.TWILIO_AUTH_TOKEN || '13b78e4dff7e4aeff05fc8eeee1f2df4';
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

// Create a Twilio client
const client = twilio(accountSid, authToken);

// Function to send a test message
async function sendTestMessage(to, customerName = "Customer", amount = "1000", reason = "Invoice #12345") {
  try {
    // Format numbers for WhatsApp
    const formattedFrom = `whatsapp:${fromNumber}`;
    const formattedTo = `whatsapp:${to}`;
    
    console.log(`Sending template message from ${formattedFrom} to ${formattedTo}`);
    
    // Send the message using the approved template
    const message = await client.messages.create({
      from: formattedFrom,
      to: formattedTo,
      contentSid: 'HXf4e550b3ee60fc5f18c33c365c21189e',
      contentVariables: JSON.stringify({
        1: customerName,
        2: amount,
        3: reason
      })
    });
    
    console.log(`Message sent with SID: ${message.sid}`);
    
    // Check message status after sending
    return checkMessageStatus(message.sid);
  } catch (error) {
    console.error('Error sending test message:', error);
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    
    if (error.code === 21608) {
      console.log('\nIMPORTANT: This error indicates you need to join the sandbox.');
      console.log('Send a WhatsApp message to +14155238886 with the phrase:');
      console.log('join [your-sandbox-code]');
      console.log('You can find your code in the Twilio Console under WhatsApp Sandbox');
    }
    
    if (error.code === 21211) {
      console.log('\nIMPORTANT: Invalid phone number format.');
      console.log('Make sure you\'re including the country code with a + sign');
      console.log('Example: +1234567890');
    }
  }
}

// Function to check the status of a message
async function checkMessageStatus(messageSid) {
  try {
    // Fetch the message by SID
    const message = await client.messages(messageSid).fetch();
    
    console.log('\nMessage Status Check:');
    console.log('---------------------');
    console.log(`Status: ${message.status}`);
    console.log(`Error Code: ${message.errorCode || 'None'}`);
    console.log(`Error Message: ${message.errorMessage || 'None'}`);
    console.log(`Date Sent: ${message.dateSent}`);
    console.log(`Direction: ${message.direction}`);
    
    // Add more detailed error information
    if (message.status === 'failed' || message.status === 'undelivered') {
      console.log('\nError Details:');
      console.log('--------------');
      console.log('Common error codes:');
      console.log('- 63015: Recipient not in Twilio WhatsApp Sandbox. Must send "join [sandbox-code]" first');
      console.log('- 63003: Message contains non-whitelisted template (in sandbox mode)');
      console.log('- 63016: Template not found or invalid template SID');
      console.log('- 63026: Invalid template parameters');
      console.log('- 21610: Message outside allowed window (24-hour rule)');
      console.log('- 21211: Invalid phone number format');
      
      if (message.errorCode === '63016') {
        console.log('\nTEMPLATE ERROR:');
        console.log('The template SID "HXf4e550b3ee60fc5f18c33c365c21189e" might be incorrect or not approved yet.');
      }
      
      if (message.errorCode === '63026') {
        console.log('\nTEMPLATE PARAMETERS ERROR:');
        console.log('The parameters provided do not match the template requirements.');
        console.log('Template format: "Hey {{1}}, your have an outstanding amount of ₹{{2}} towards {{3}}. Kindly pay it back as soon as possible."');
      }
      
      console.log('\nRECOMMENDED ACTION:');
      console.log('Send a WhatsApp message from your phone to +14155238886 with:');
      console.log('join [your-sandbox-code]');
    }
    
    return message;
  } catch (error) {
    console.error('Error checking message status:', error);
  }
}

// Get command line arguments
const testPhoneNumber = process.argv[2] || '+YOUR_PHONE_NUMBER';
const customerName = process.argv[3] || 'Customer';
const amount = process.argv[4] || '1000';
const reason = process.argv[5] || 'Invoice #12345';

if (testPhoneNumber === '+YOUR_PHONE_NUMBER') {
  console.log('Please provide a phone number as an argument:');
  console.log('node test-whatsapp.js +1234567890 "Customer Name" "5000" "Invoice #54321"');
} else {
  console.log('Testing WhatsApp Template Messaging with Twilio');
  console.log('------------------------------------');
  console.log(`Account SID: ${accountSid}`);
  console.log(`From Number: ${fromNumber}`);
  console.log(`To Number: ${testPhoneNumber}`);
  console.log(`Customer Name: ${customerName}`);
  console.log(`Amount: ₹${amount}`);
  console.log(`Reason: ${reason}`);
  console.log('------------------------------------\n');
  
  sendTestMessage(testPhoneNumber, customerName, amount, reason);
}
