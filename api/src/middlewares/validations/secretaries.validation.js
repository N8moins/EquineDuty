const {Joi} = require('express-validation');
const {isOrganizerOwnsShow} = require('./shows.validation.js');
const {secretaryByShowId} = require('../../services/shows.service.js');

/**
 * Validations for secretary
 */
const validationSecretary = {
  body: Joi.object({
    name: Joi.string().required()
        .regex(/^[\wÀ-ÿ'-]+(?:\s[\wÀ-ÿ'-]+)*\s[\wÀ-ÿ'-]+$/),
    email: Joi.string().email().required().max(255),
    phone: Joi.string().required()
    // eslint-disable-next-line max-len
        .regex(/^(1( |-|))?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/),
  }),
};


/**
 * Check if organizer owns the show or is an admin
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} next or error message
 */
async function isOrganizerOwnShowOrAdmin(req, res, next) {
  try {
    if (req.user.role == 'ADMIN') {
      return next();
    }
    return await isOrganizerOwnsShow(req, res, next);
  } catch (error) {
    return res.status(404).json({error: 'Secretary id not found'});
  }
}

/**
 * Check if secretary id has the role secretary
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} next or error message
 */
async function isSecretaryShowSecretaryId(req, res, next) {
  try {
    const show = await secretaryByShowId(parseInt(req.params.showId));
    if (show.secretary.role != 'SECRETARY' ) {
      return res.status(404)
          .json({error: 'Secretary id does not have the role secretary'});
    }
    return next();
  } catch (error) {
    return res.status(404).json({error: error});
  }
}


module.exports = {
  validationSecretary,
  isOrganizerOwnShowOrAdmin,
  isSecretaryShowSecretaryId,
};
