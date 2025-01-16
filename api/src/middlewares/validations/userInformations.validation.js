const {Joi} = require('express-validation');

// Appart for the cavaliers
const phoneValidation = {
  body: Joi.object({
    // Format of the phone number: 450-348-9999
    phone: Joi.string()
    // eslint-disable-next-line max-len
        .regex(/^(1( |-|))?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/)
        .required(),
  }),
};

const emailValidation = {
  body: Joi.object({
    email: Joi.string().email().required().max(255),
  }),
};

const userInfoValidation = {
  body: Joi.object({
    phone: Joi.string()
    // eslint-disable-next-line max-len
        .regex(/^(1( |-|))?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/)
        .required(),
    email: Joi.string().email().required().max(255),
    birhtdate: Joi.date().required(),
  },
  )};


module.exports = {
  phoneValidation,
  userInfoValidation,
  emailValidation,
};
