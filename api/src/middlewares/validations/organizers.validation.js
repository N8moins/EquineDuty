const {Joi} = require('express-validation');
const prisma = require('../../../prisma/client.js');

/**
 * Validations for organizer
 */
const validationOrganizer = {
  body: Joi.object({
    name: Joi.string().required()
        .regex(/^[\wÀ-ÿ'-]+(?:\s[\wÀ-ÿ'-]+)*\s[\wÀ-ÿ'-]+$/),
    email: Joi.string().email().required().max(255),
    phone: Joi.string().required()
    // eslint-disable-next-line max-len
        .regex(/^(1( |-|))?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/),
    remaining_shows: Joi.number().required().min(0),
  }),
};

/**
 * Check if the user is connected to Stripe
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {*} next or error
 */
async function isOrganizerStripeConnected(req, res, next) {
  try {
    const stripeConnectExists = await prisma.stripeAccountUsers.findUnique({
      where: {
        user_id: req.user.id,
      },
    });

    if (stripeConnectExists === null || stripeConnectExists === undefined) {
      return res.status(400).json({message: 'Stripe account not connected'});
    }

    next();
  } catch (error) {
    return res.status(400).json({message: 'Stripe account not connected'});
  }
}

module.exports = {
  validationOrganizer,
  isOrganizerStripeConnected,
};
