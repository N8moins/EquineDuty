const express = require('express');
const {validate} = require('express-validation');
const rateLimit = require('express-rate-limit');
const router = express.Router({mergeParams: true});
const {emailValidate} =
 require('../middlewares/validations/contact.validation.js');
const {sendEmailToContact} = require('../controllers/contact.controller.js');

const limiterContact = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2, // 2 requests
  message: 'Too many requests from this IP, please try again after 1 minute',
});

router.post('/',
    limiterContact,
    validate(emailValidate, {}, {}),
    sendEmailToContact);

module.exports = router;
