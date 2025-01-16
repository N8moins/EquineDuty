const {sendEmail} = require('./nodemailer');

/**
 * Send an email to contact
 * @param {string} name name of the sender
 * @param {string} email email address of the receiver
 * @param {string} phone phone number
 * @param {string} message message
 */
async function sendContactEmail(name, email, phone, message) {
  message = message.replace(/[<>]/g, '');
  const htmlContent = `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
    </style>
  </head>
  <body>
  <p><strong>From: </strong>Equine Duty</p>
    <p>Hello,</p>
    <p>You have received a message from a user:</p>
    <p>Name: ${name}</p>
    <p>Email: ${email}</p>
    <p>Phone: ${phone}</p>
    <p>Message: ${message}</p>
  </body>
  </html>
`;
  await sendEmail(process.env.EMAIL_CONTACT, 'Contact Email', htmlContent);
}

module.exports = {sendContactEmail};
