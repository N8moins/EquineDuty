const {Joi} = require('express-validation');
const prisma = require('../../../prisma/client');
const {showByIdAllData} = require('../../services/shows.service');

const validationInscription = {
  body: Joi.object({
    horse_id: Joi.number().positive().required(),
    rider_id: Joi.number().positive().required(),
    no_fei: Joi.string().length(8).pattern(/^\d+$/).allow(null).optional(),
    nb_stalls: Joi.number().positive().allow(0).required(),
    nb_tack_stalls: Joi.number().positive().allow(0).required(),
    nb_hay_bale: Joi.number().positive().allow(0).required(),
    nb_chiving_bags: Joi.number().positive().allow(0).required(),
    show_asked_codes: Joi.object().allow(null).required(),
    nb_days: Joi.number().positive().allow(0).required(),
    Shows_Packages: Joi.array().items(
        Joi.object({
          id: Joi.number().positive().required(),
          count: Joi.number().positive().required().min(0),
        }),
    ).allow(null).required(),
  }),
};

const validationApproval = {
  body: Joi.object({
    approved: Joi.boolean().required(),
  }),
};


/**
 * Middleware to check if horse exist in bd with the body
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isHorseExistsBody(req, res, next) {
  try {
    const horse_id = req.body.horse_id;

    const result = await prisma.horses.findUnique({
      where: {
        id: horse_id,
      },
    });

    return !result ?
    res.status(404).json({error: 'Horse id not found'}) :
    next();
  } catch (error) {
    return res.status(404).json({error: 'Horse id not found'});
  }
}

/**
 * Middleware to check if rider exist in bd with the body
 * @param {*} req request
 * @param {*} res result
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isRiderExistsBody(req, res, next) {
  try {
    const rider_id = req.body.rider_id;

    const result = await prisma.riders.findUnique({
      where: {
        id: rider_id,
      },
    });
    return !result ?
    res.status(404).json({error: 'Rider id not found'}) :
    next();
  } catch (error) {
    return res.status(404).json({error: 'Rider id not found'});
  }
}

/**
 * Check if entry number rider exist and
 * if rhe rider is registered in a show
 * @param {*} req request
 * @param {*} res result
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isEntryNumberExistsBody(req, res, next) {
  try {
    const rider_entry_number = req.body.rider_entry_number;
    const riderId = req.params.riderId;
    const showId = req.params.showId;

    const result = await prisma.inscriptions.findFirst({
      where: {
        rider_entry_number: parseInt(rider_entry_number),
        rider_id: parseInt(riderId),
        show_id: parseInt(showId),
      },
    });
    return !result ?
    res.status(404).json({error: 'Rider entry number not found'}) :
    next();
  } catch (error) {
    return res.status(404).json({error: 'Rider entry number not found'});
  }
}

/**
 * Middleware to check if inscription exist in bd
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isInscriptionDate(req, res, next) {
  try {
    const show_id = parseInt(req.params.showId);
    const show = await prisma.shows.findUnique({
      where: {
        id: show_id,
      },
    });

    const date = new Date();

    // i do this instead of doing it in the if, because the condition does not
    // work in the if for an unknown reason, but works if you assign it to a
    // variable
    const withinLateInscriptionLimit = show.inscription_end_late_date =!null &&
      date < show.inscription_end_late_date &&
      date > show.inscription_start_date;
    if (withinLateInscriptionLimit) {
      return next();
    }
    if (date < show.inscription_start_date ||
      date > show.inscription_end_date) {
      return res.status(400).json(
          {error: 'The inscription is not in the inscription dates'});
    }

    return next();
  } catch (error) {
    return res.status(400).json(
        {error: 'The inscription is not in the inscription dates'});
  }
}

/**
 * Middleware to check if inscription exist in bd
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isIncriptionExists(req, res, next) {
  try {
    const inscription_id = parseInt(req.params.inscriptionId);

    const result = await prisma.inscriptions.findUnique({
      where: {
        id: inscription_id,
      },
    });


    if (!result || result === null || result === undefined) {
      return res.status(404).json({error: 'Inscription id not found'});
    }

    return next();
  } catch (error) {
    return res.status(404).json({error: 'Inscription id not found'});
  }
}

/**
 * Middleware to check if inscription of user exist in bd
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isUserIncriptionExists(req, res, next) {
  try {
    const inscription_id = parseInt(req.params.id);

    const result = await prisma.inscriptions.findUnique({
      where: {
        id: inscription_id,
      },
    });

    if (!result || result === null || result === undefined) {
      return res.status(404).json({error: 'Inscription id not found'});
    }

    if (result.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'You are not the owner of this inscription',
      });
    }

    return next();
  } catch (error) {
    return res.status(404).json({error: 'Inscription id not found'});
  }
}

/**
 * Middleware to check if nbdays for the stall
 *  is within the show days limit
 * @param {*} req request
 * @param {*} res result
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isShowWithinDaysLimit(req, res, next) {
  try {
    const show = await showByIdAllData(req.params.showId);
    const startDate = new Date(show.start_date);
    const endDate = new Date(show.end_date);

    // Set both dates to midnight
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    // Calculate the difference in milliseconds
    const timeDiff = endDate.getTime() - startDate.getTime();
    // Convert milliseconds to days
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    if (req.body.nb_days > daysDiff) {
      return res.status(400)
          .json({error: 'The number of days is greater' +
          ' than the show duration'});
    }

    return next();
  } catch (error) {
    return res.status(404)
        .json({error: 'There was an error with your request'});
  }
}

/**
 * Middleware to check if the number of days
 * and the number of stalls or tack stalls need to either be both 0
 * or both more than 0
 * @param {*} req request
 * @param {*} res result
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isNbDayWithNbStallOrStack(req, res, next) {
  if ( req.body.nb_days > 0 &&
    (req.body.nb_stalls >= 0 || req.body.nb_tack_stalls >= 0)) {
    return next();
  } else if ( req.body.nb_days === 0 &&
     (req.body.nb_stalls === 0 && req.body.nb_tack_stalls === 0)) {
    return next();
  }
  return res.status(400).json({error: 'The number of days' +
  ' and the number of stalls or tack stalls need to either be both 0 '+
  'or both more than 0'});
}

/**
 * Middleware to check if the user is associated with the inscription
 * @param {*} req request
 * @param {*} res result
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isUserAssociatedWithInscription(req, res, next) {
  try {
    if (req.user.role === 'ADMIN') {
      return next();
    }
    const inscription_id = parseInt(req.params.inscriptionId);

    const inscription = await prisma.inscriptions.findUnique({
      where: {
        id: inscription_id,
        user_id: req.user.id,
      },
    });

    if (!inscription || inscription === null || inscription === undefined) {
      return res.status(401)
          .json({error: 'User is not associated with this inscription'});
    }

    return next();
  } catch (error) {
    return res.status(500)
        .json({error: 'There was an error with your request'});
  }
}

module.exports = {
  validationInscription,
  validationApproval,
  isHorseExistsBody,
  isRiderExistsBody,
  isIncriptionExists,
  isInscriptionDate,
  isUserIncriptionExists,
  isShowWithinDaysLimit,
  isNbDayWithNbStallOrStack,
  isEntryNumberExistsBody,
  isUserAssociatedWithInscription,
};
