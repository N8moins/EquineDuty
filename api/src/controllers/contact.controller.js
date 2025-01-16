const {sendContactEmail} = require('../emails/emailContact');

/**
 * Send an email to the contact
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<void>} response
 */
async function sendEmailToContact(req, res) {
  try {
    await sendContactEmail(
        req.body.name, req.body.email, req.body.phone, req.body.message);
    res.status(200).json({message: 'Email sent successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to send email'});
  }
}

module.exports = {
  sendEmailToContact,
};
