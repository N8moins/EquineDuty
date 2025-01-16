const {sendEmail} = require('./nodemailer');

/**
 * Send an email to verify the email address
 * @param {string} email email address of the receiver
 * @param {string} tokenVerification token verification
 * @return {Promise<Response>} response
 */
async function sendVerificationEmail(email, tokenVerification) {
  const verificationLink =
  `${process.env.CLIENT_URL}/verify-email/${tokenVerification}`;

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
    <p>Please click the link below to verify your email address.</p>
    <a href="${verificationLink}">Verify</a>
  </body>
  </html>
  `;
  await sendEmail(email, 'Verify Your Email Address', htmlContent);
  return {message: 'Email sent'};
}

module.exports = {sendVerificationEmail};
