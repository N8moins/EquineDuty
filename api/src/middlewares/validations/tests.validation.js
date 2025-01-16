const {Joi} = require('express-validation');
const {getTestById} = require('../../services/tests.service.js');

const mark = Joi.object().keys({
  move_name: Joi.string().required().regex(/^[a-zA-Z0-9\s]+$/),
  note: Joi.number().integer().positive().required().min(0),
  coef_points: Joi.number().positive().required(),
  type: Joi.string()
      .pattern(/^(COLLECTIVE|STANDARD)$/)
      .required(),
});

/**
 * Validations for test
 */
const validationTests = {
  body: Joi.object({
    number: Joi.string().required().regex(/^[a-zA-Z0-9\s]+$/),
    name: Joi.string().required()
        .regex(/^[\wÀ-ÿ'\-\s]+/),
    short_name: Joi.string().required()
        .regex(/^[\wÀ-ÿ'\-\s]+/),
    points_precision: Joi.number().integer().required().min(0),
    duration_minute: Joi.number().integer().positive().required().min(0),
    nb_standard_marks: Joi.number().integer().optional().allow(null).min(0),
    nb_collectives_marks: Joi.number().integer().optional().allow(null).min(0),
    total_points_possibility: Joi.number().integer().required().min(0),
    marks: Joi.array().items(mark).required(),
  }),
};

/**
 * Check if the count of marks type is more then test nb_standard_marks
 * or nb_collectives_marks
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 */
async function isCountOfMarksTypeIsMoreThenTests(req, res, next) {
  try {
    const data = req.body;
    const {
      nb_standard_marks,
      nb_collectives_marks,
      marks,
    } = data;
    const testNbStandard = nb_standard_marks;
    const testNbCollective = nb_collectives_marks;
    let countStandard = 0;
    let countCollective = 0;

    marks.map((mark) => {
      if (mark.type === 'STANDARD') {
        countStandard += 1;
      } else {
        countCollective += 1;
      }
    });

    if (countStandard > testNbStandard || countCollective > testNbCollective) {
      return res.status(403).json({error: 'Count of mark standard is full or ' +
      'count of mark collective is full'});
    }
    next();
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Check if test exist
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 */
async function isTestExists(req, res, next) {
  try {
    const test = await getTestById(parseInt(req.params.testId));

    return !test ? res.status(404).json({error: 'Test id not found'}) : next();
  } catch (error) {
    return res.status(404).json({error: 'Test id not found'});
  }
}

/**
 * Check if test exist while using request body.
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 */
async function isTestExistsBody(req, res, next) {
  try {
    const test = await getTestById(parseInt(req.body.test_id));

    if (test.user_id !== req.user.id) {
      return res.status(403).json({error: 'The user does not own the test.'});
    }
    return !test ? res.status(404).json({error: 'Test id not found'}) : next();
  } catch (error) {
    return res.status(404).json({error: 'Test id not found'});
  }
}

/**
 * Check if user owns the test while using request body.
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 */
async function isUserOwnsTestBody(req, res, next) {
  try {
    const test = await getTestById(parseInt(req.body.test_id));
    console('USER' + test.user_id);
    if (test.user_id !== req.user.id) {
      res.status(403).json({error: 'The user does not own the test.'});
    }
    next();
  } catch (error) {
    return res.status(404).json({error: 'Test id not found'});
  }
}

/**
 * Check if the user owns the test
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 */
async function isUserOwnsTest(req, res, next) {
  try {
    const test = await getTestById(parseInt(req.params.testId));

    if (test.user_id !== req.user.id) {
      res.status(403).json({error: 'The user does not own the test.'});
    }
    next();
  } catch (error) {
    return res.status(404).json({error: 'Test id not found'});
  }
}

module.exports = {
  validationTests,
  isTestExists,
  isUserOwnsTest,
  isTestExistsBody,
  isCountOfMarksTypeIsMoreThenTests,
  isUserOwnsTestBody,
};
