const {sendEmail} = require('./nodemailer');

/**
 * Send an email to activite an secretary
 * @param {string} email email address of the receiver
 * @param {string} password random password
 * @param {string} name secretary'name
 */
async function sendSecretaryAccountEmail(email, password, name) {
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
    <p>Your secretary account has been successfully created.</p>
    <p>You have been assigned a temporary password: ${password}</p>
    <p>You will need to change it upon your first login.</p>
  </body>
  </html>
`;

  sendEmail(email, 'Secretary Account', htmlContent);
}

/**
 * Send an email to notify the secretary that his role has been removed
 * @param {string} email email address of the receiver
 * @param {string} name secretary'name
 */
async function sendSecretaryRoleRemoved(email, name) {
  sendEmail(email, 'Secretary Account Role Removed',
      'Hello ' + name + ',\n' +
      'Your secretary role has been removed by either an administrator ' +
      'or your organizer if you belive it to be by mistake, please' +
      ' contact your organizer.');
}


module.exports = {sendSecretaryAccountEmail, sendSecretaryRoleRemoved};
