const {Joi} = require('express-validation');
const {verifyShowLinkedPackage} = require('../../services/bundles.service');
const {showByIdAllData} = require('../../services/shows.service.js');
/**
 * Validations for bundles
 */
const validationBundles = {
  body: Joi.object({
    description: Joi.string().required(),
    name: Joi.string().required().regex(/^[\wÀ-ÿ'\-\s]+/),
    price: Joi.number().integer().positive().required().allow(0),
    chiving: Joi.number().integer().positive().allow(0).optional(),
    hays: Joi.number().integer().positive().allow(0).optional(),
    stalls: Joi.number().integer().positive().allow(0).optional(),
    tack_stalls: Joi.number().integer().positive().allow(0).optional(),
  }),
};

/**
 * Check if bundle stalls or tack_stalls are more then the show's stalls
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} return error or next
 */
async function isBundleStallsAreMoreThenShowStalls(req, res, next) {
  try {
    const show = await showByIdAllData(parseInt(req.params.showId));

    const nb_total_stalls_show =
    parseInt(show.nb_temp_stalls) +
    parseInt(show.nb_permanent_stalls);

    const nb_stalls_bundle = parseInt(req.body.stalls);

    if (nb_total_stalls_show < nb_stalls_bundle) {
      return res.status(400).json({error:
        'The number of stalls is more than the show stall'});
    }

    const nb_total_tack_stalls_show =
      parseInt(show.nb_free_temp_stalls + show.nb_free_permanent_stalls);
    const nb_tack_stalls_bundle = parseInt(req.body.tack_stalls);

    if (nb_total_tack_stalls_show < nb_tack_stalls_bundle) {
      return res.status(400).json({error:
        'The number of tack stalls is more than the show tack stalls'});
    }

    return next();
  } catch (error) {
    return res.status(404).json({error: error});
  }
}

/**
 * Check if bundle exists or is undefined
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} class
 */
async function isBundleArrayExistsOrIsUndefined(req, res, next) {
  try {
    for (const bundle of (req.body.Shows_Packages?? [])) {
      const _bundle =
      await verifyShowLinkedPackage(parseInt(req.params.showId),
          parseInt(bundle.id));
      if (_bundle == null || _bundle == undefined) {
        return res.status(404)
            .json({error: 'Bundle id with show id not found'});
      }
    }
    return next();
  } catch (error) {
    return res.status(404).json({error: 'There was an error with the bundle'});
  }
}

/**
 * Check if bundle id are unique
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} class
 */
async function areBundleIdUnique(req, res, next) {
  try {
    const _bundle = (req.body.Shows_Packages?? []).map((bundle) => bundle.id);
    if (new Set(_bundle).size !== _bundle.length) {
      return res.status(400).json({error: 'Bundle id are not unique'});
    }
    return next();
  } catch (error) {
    return res.status(404).json({error: 'There was an error with the bundle'});
  }
}

module.exports = {
  validationBundles,
  isBundleStallsAreMoreThenShowStalls,
  isBundleArrayExistsOrIsUndefined,
  areBundleIdUnique,
};
