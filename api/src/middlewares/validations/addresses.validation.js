const {Joi} = require('express-validation');
const {getAddressById} = require('../../services/addresses.service.js');
const {showByIdAllData} = require('../../services/shows.service.js');
addressValidation = {
  body: Joi.object({
    street_address: Joi.string().required()
        .regex(/[0-9]{0,4}(\s[a-zA-Z0-9]+)+/),
    province: Joi.string().required().regex(/(?:[a-zA-Z-]+\s*)+/),
    country: Joi.string().required().regex(/(?:[a-zA-Z-]+\s*)+/),
    city: Joi.string().required().regex(/(?:[a-zA-Z0-9-]+\s*)+/),
    zip_code: Joi.string().regex(/^[A-Z][0-9][A-Z][0-9][A-Z][0-9]/).required(),
    other_information: Joi.string().optional(),
  }),
};

/**
 * Check if an address exist when using multer
 * @param {string} organizer_id
 * @param {string} address_id
 * @return {Promise<*>} error message or undefined
 */
async function isAddressExistMulter(organizer_id, address_id) {
  try {
    const organizer_id_ = organizer_id ? parseInt(organizer_id) : 0;
    const address = await getAddressById(
        parseInt(address_id), parseInt(organizer_id_));
    if (!address) {
      return 'Address id not found';
    }
    return undefined;
  } catch (error) {
    return 'There was an error';
  }
}

/**
 * Check if an address exist
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} error message or next
 */
async function isAddressExist(req, res, next) {
  try {
    const address = await getAddressById(
        parseInt(req.body.address_id), parseInt(req.user.id));
    if (!address) {
      return res.status(404).json({error: 'Address id not found'});
    }
    return next();
  } catch (error) {
    return res.status(400).json({error: 'There was an error'});
  }
}

/**
 * Check if an address exist with a show id
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} error message or next
 */
async function isAddressExistWithShowOrganizerId(req, res, next) {
  try {
    const show = await showByIdAllData(parseInt(req.params.showId));
    const address = await getAddressById(
        parseInt(req.body.address_id), parseInt(show.organizer_id));
    if (!address) {
      return res.status(404).json({error: 'Address id not found'});
    }
    return next();
  } catch (error) {
    return res.status(404).json({error: 'Address id not found'});
  }
}
module.exports = {
  addressValidation,
  isAddressExistMulter,
  isAddressExist,
  isAddressExistWithShowOrganizerId,
};
