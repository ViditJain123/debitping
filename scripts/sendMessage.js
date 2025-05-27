const readline = require('readline-sync');
const twilio = require('twilio');

// 🔐 Replace with your actual Twilio credentials
const accountSid = 'AC469394a0980a8203320458030583aa08';
const authToken = '13b78e4dff7e4aeff05fc8eeee1f2df4';
const client = twilio(accountSid, authToken);

// 📥 Prompt user for inputs
const param1 = readline.question("Enter name: ");
const param2 = readline.question("Enter amount: ");
const param3 = readline.question("Enter reason: ");

// 📤 Send the message using your template
client.messages
  .create({
    to: '+919024559696',
    from: 'whatsapp:+14155238886', // Replace with your Twilio sandbox or approved sender
    template: {
      templateSid: 'HXf4e550b3ee60fc5f18c33c365c21189e',
      parameters: [
        { type: 'text', text: param1 },
        { type: 'text', text: param2 },
        { type: 'text', text: param3 }
      ]
    },
    contentSid: 'HXf4e550b3ee60fc5f18c33c365c21189e',
  })
  .then(message => console.log("Message sent! SID:", message.sid))
  .catch(err => console.error("Error sending message:", err));