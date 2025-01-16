const {Joi} = require('express-validation');

const emailValidate = {
  body: Joi.object({
    name: Joi.string().required()
        .regex(/^[\wÀ-ÿ'-]+(?:\s[\wÀ-ÿ'-]+)*\s[\wÀ-ÿ'-]+$/),
    email: Joi.string().email().required().max(255),
    message: Joi.string().required(),
    phone: Joi.string().optional().allow(null)
        .regex(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/),
  }),
};

module.exports = {
  emailValidate,
};
