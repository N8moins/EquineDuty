const Joi = require('joi');

const validationPassword = {
  body: Joi.object({
    old_password: Joi.string().required(),
    new_password: Joi.string()
        .min(8)
        .regex(
            // eslint-disable-next-line max-len
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]{8,}$/,
        )
        .required(),
  }),
};

const validationPasswordReset = {
  body: Joi.object({
    token: Joi.string().required(),
    password: Joi.string()
        .min(8)
        .regex(
            // eslint-disable-next-line max-len
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]{8,}$/,
        )
        .required(),
  }),
};

const validationUser = {
  body: Joi.object({
    name: Joi.string().required()
        .regex(/^[\wÀ-ÿ'-]+(?:\s[\wÀ-ÿ'-]+)*\s[\wÀ-ÿ'-]+$/),
    email: Joi.string().email().required().max(255),
    role: Joi.string()
        .valid('USER', 'ORGANIZER', 'SECRETARY', 'ADMIN')
        .required(),
    birthdate: Joi.date().optional().allow(null),
    phone: Joi.string().required()
        // eslint-disable-next-line max-len
        .regex(/^(1( |-|))?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/),
    is_verified: Joi.boolean().required(),
    is_active: Joi.boolean().required(),
    remaining_shows: Joi.number().integer().positive().optional().allow(null),
  }),
};

const validationUserNameAnBirth = {
  body: Joi.object({
    name: Joi.string().required()
        .regex(/^[\wÀ-ÿ'-]+(?:\s[\wÀ-ÿ'-]+)*\s[\wÀ-ÿ'-]+$/),
    birthdate: Joi.date().optional().allow(null),
    phone: Joi.string().required()
    // eslint-disable-next-line max-len
        .regex(/^(1( |-|))?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/),
  }),
};

module.exports = {
  validationPassword,
  validationPasswordReset,
  validationUser,
  validationUserNameAnBirth,
};
