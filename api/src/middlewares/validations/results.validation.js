const {Joi} = require('express-validation');
const {
  getResultsByRiderTestId,
  getResultsByRiderTestIdJudgeId,
} = require('../../services/results.service.js');

const validationResult = {
  body: Joi.object({
    score: Joi.number().required().min(0),
    nbErrors: Joi.number().required().min(0),
    reason: Joi.string()
        .pattern(/^(ELEMINATED|HC|NO_SHOW|RETIRED|SCRATCH|VET_OUT|WITHDREW)$/)
        .required(),
    horse_id: Joi.number().required().min(0),
    rider_entry_number: Joi.number().required().min(0),
  }),
};

/**
 * Check if the association of test and rider exists in the results table
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 */
async function isResultsExist(req, res, next) {
  try {
    const results = await getResultsByRiderTestId(
        parseInt(req.params.testId), parseInt(req.params.riderId));
    if (!results) {
      return res.status(204).json();
    }
    return next();
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Check if the association of test and rider already
 * exists in the results table
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 */
async function isResultsAlreadyExists(req, res, next) {
  try {
    const results = await getResultsByRiderTestIdJudgeId(
        parseInt(req.params.testId),
        parseInt(req.params.riderId),
        parseInt(req.params.judgeId));
    if (results) {
      return res.status(403).json({
        error: 'The judge already create the result of this rider'});
    }
    return next();
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}


module.exports = {
  validationResult,
  isResultsExist,
  isResultsAlreadyExists,
};

