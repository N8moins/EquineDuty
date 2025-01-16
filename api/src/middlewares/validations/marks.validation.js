const {Joi} = require('express-validation');

/**
 * Validations for marks
 */
const validationMarks = {
  body: Joi.object({
    move_name: Joi.string().required()
        .regex(/^[\wÀ-ÿ'\-\s]+/),
    note: Joi.number().integer().positive().required().min(0),
    coef_points: Joi.number().positive().required().min(0),
    type: Joi.string()
        .pattern(/^(COLLECTIVE|STANDARD)$/)
        .required(),
  }),
};

module.exports = {
  validationMarks,
};
