const {Joi} = require('express-validation');
const {getRiderById} = require('../../services/riders.service.js');

const validationRider = {
  body: Joi.object({
    name: Joi.string().required()
        .regex(/^[\wÀ-ÿ'-]+(?:\s[\wÀ-ÿ'-]+)*\s[\wÀ-ÿ'-]+$/),
    phone: Joi.string().required()
    // eslint-disable-next-line max-len
        .regex(/^(1( |-|))?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/),
    email: Joi.string().email().required().max(255),
    no_fei: Joi.string().length(8).pattern(/^\d+$/).allow(null).optional(),
    emergency_name: Joi.string().required()
        .regex(/^[\wÀ-ÿ'-]+(?:\s[\wÀ-ÿ'-]+)*\s[\wÀ-ÿ'-]+$/),
    emergency_phone: Joi.string().required()
    // eslint-disable-next-line max-len
        .regex(/^(1( |-|))?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/),
    stable_name: Joi.string().required().regex(/^[\wÀ-ÿ'\-\s]+/),
    trainer_name: Joi.string().required()
        .regex(/^[\wÀ-ÿ'-]+(?:\s[\wÀ-ÿ'-]+)*\s[\wÀ-ÿ'-]+$/),
  }),
};


/**
 * Check if rider exists
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} rider
 */
async function isRiderExists(req, res, next) {
  try {
    const rider = await getRiderById(
        parseInt(req.params.riderId),
    );
    if (!rider) {
      return res.status(404).json({error: 'Rider id not found'});
    }

    return next();
  } catch (error) {
    return res.status(404).json({error: 'Rider id not found'});
  }
}

module.exports = {
  validationRider,
  isRiderExists,
};
