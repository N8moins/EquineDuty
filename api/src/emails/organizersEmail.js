const {sendEmail} = require('./nodemailer');
/**
 * Send an email to activite an organizer
 * @param {string} email email address of the receiver
 * @param {string} password random password
 * @param {string} name organizer'name
 */
async function sendOrganizerAccountEmail(email, password, name) {
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
    <p>Hello ${name},</p>
    <p>Your organizer's account has been successfully created.</p>
    <p>You have been assigned a temporary password: ${password}</p>
    <p>You will need to change it upon your first login.</p>
  </body>
  </html>
`;
  sendEmail(email, 'Organizer Account', htmlContent);
}

module.exports = {sendOrganizerAccountEmail};
