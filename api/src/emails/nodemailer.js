const nodemailer = require('nodemailer');

/**
 * Send an email
 * @param {string} receiver email address of the receiver
 * @param {string} subject email subject
 * @param {string} body email body
 * @return {Promise<boolean>} true if the email was sent, false otherwise
 */
async function sendEmail(receiver, subject, body) {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const emailOption = {
    from: {
      name: process.env.EMAIL_NAME,
      address: process.env.EMAIL_FROM,
    },
    to: receiver,
    subject: subject,
    html: body,
  };

  try {
    await transport.sendMail(emailOption);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {sendEmail};
