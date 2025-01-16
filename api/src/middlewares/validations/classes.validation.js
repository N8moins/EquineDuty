const {Joi} = require('express-validation');
const {getClassById, getJudgeById} =
require('../../services/classes.service.js');
const prisma = require('../../../prisma/client');

/**
 * Validations for judge
 */
const judgesValidation =
  Joi.object({
    ring_name: Joi.string().required().regex(/^[\wÀ-ÿ'\-\s]+/),
    name: Joi.string().required()
        .regex(/^[\wÀ-ÿ'\-\s]+/),
    ring_position: Joi.string().pattern(/^(E|H|C|M|B)$/),
  }).required();

/**
 * Validations for classes
 */
const validationClasses = {
  body: Joi.object({
    number: Joi.string().required().regex(/^[a-zA-Z0-9]+$/),
    name: Joi.string().required().regex(/^[\wÀ-ÿ'\-\s]+/),
    date: Joi.date().required(),
    price_entry: Joi.number().integer().positive().required().min(0),
    is_test_of_choice: Joi.boolean().required(),
    level_type: Joi.string().required().regex(/^[a-zA-Z]+$/),
    ring_name: Joi.string().required().regex(/[a-zA-Z\s]*/),
    ring_number: Joi.string().required().regex(/[a-zA-Z0-9]*/),
    test_id: Joi.number().integer().positive().required(),
    judges: Joi.array().items(judgesValidation).required(),
  }),
};

/**
 * Check if class exists
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} class
 */
async function isClassExists(req, res, next) {
  try {
    const _class = await getClassById(parseInt(req.params.classId));
    if (!_class) {
      return res.status(404).json({error: 'Class id not found'});
    }

    return next();
  } catch (error) {
    return res.status(404).json({error: 'Class id not found'});
  }
}

/**
 * Check if judge exists
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} class
 */
async function isJudgeExists(req, res, next) {
  try {
    const judge = await getJudgeById(parseInt(req.params.judgeId));
    if (!judge) {
      return res.status(404).json({error: 'Judge id not found'});
    }

    return next();
  } catch (error) {
    return res.status(404).json({error: 'Judge id not found'});
  }
}

/**
 * Check if class is on the same show of the param
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} class
 */
async function isClassInShow(req, res, next) {
  try {
    const _class = await getClassById(parseInt(req.params.classId));
    if (_class.show_id !== parseInt(req.params.showId)) {
      return res.status(400).json({error: 'The show does not own the classe'});
    }

    return next();
  } catch (error) {
    return res.status(404).json({error: 'Class id not found'});
  }
}
/**
 * Check if class is within dates of show
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} class
 */
async function isClassInStartedInscriptionOfShow(req, res, next) {
  const currentDate = new Date();

  try {
    const classId = parseInt(req.params.classId);
    const _class = await prisma.classes.findUnique({
      where: {
        id: classId,
      },
      include: {
        show: true,
      },
    });
    const {inscription_start_date} = _class.show;
    if (currentDate > inscription_start_date) {
      return res
          .status(403)
          .json({
            error:
            'Cannot modify or delete class, ' +
            'after inscriptions start date of a show',
          });
    }

    return next();
  } catch (error) {
    return res.status(500).json(error);
  }
}

module.exports = {
  validationClasses,
  isClassInStartedInscriptionOfShow,
  isClassExists,
  isClassInShow,
  isJudgeExists,
};
