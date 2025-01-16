const {sendEmail} = require('./nodemailer');

/**
 * Send an email to verify the email address
 * @param {string} email email address of the receiver
 * @param {string} tokenVerification token verification
 * @return {Promise<Response>} response
 */
async function sendForgotPassword(email, tokenVerification) {
  const verificationLink =
  `${process.env.CLIENT_URL}/reset-password/${tokenVerification}`;

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
  <div class="container">
    <p><strong>From: </strong>Equine Duty</p>
    <p>Hello,</p>
    <p>Please use the following link to reset your password:</p>
    <a href="${verificationLink}">Reset Password</a>
    <p>If you did not request a password reset, you can ignore this email.</p>
  </div>
</body>
  </html>
  `;
  await sendEmail(email, 'Reset Your Password Equine Duty', htmlContent);
  return {message: 'Email sent'};
}

module.exports = {sendForgotPassword};
