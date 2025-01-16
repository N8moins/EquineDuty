const {Joi} = require('express-validation');
const FileType = require('file-type');
const {
  showById,
  showByIdAllData,
  showAdminById,
  getShowIsPublised,
} = require('../../services/shows.service.js');
const dictRole = {
  USER: 1,
  SECRETARY: 100,
  ORGANIZER: 200,
  ADMIN: 300,
};
const multer = require('multer');
const {
  isAddressExistWithShowOrganizerId,
} = require('./addresses.validation.js');
const prisma = require('../../../prisma/client.js');
const {deleteFileDoc} = require('../../controllers/shows.controller.js');

/**
 * Role values
 * @param {string} roleString role as a string
 * @return {number} number
 * @author Maxime Labrecque
 */
const roleValues = (roleString) => dictRole[roleString];

/**
 * Check if show exists
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} return error or next
 */
async function isShowExists(req, res, next) {
  try {
    const show = await showById(parseInt(req.params.showId));
    if (!show) {
      return res.status(404).json({error: 'Show id not found'});
    }

    return next();
  } catch (error) {
    return res.status(404).json({error: 'Show id not found'});
  }
}

/**
 * Check if show organizer id is the same of the user
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} show
 */
async function isOrganizerOwnsShow(req, res, next) {
  try {
    const show = await showById(parseInt(req.params.showId));
    if (roleValues(req.user.role) >= roleValues('ADMIN')) {
      return next();
    }
    if (
      req.user.id === show.organizer.id &&
      roleValues(req.user.role) >= roleValues('SECRETARY')
    ) {
      return next();
    }
    return res.status(404).json({error: 'The user does not own the show.'});
  } catch (error) {
    return res.status(403).json('Forbidden');
  }
}
/**
 * Check if show id is the same as the request user
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isSameOrganizer(req, res, next) {
  if (
    req.user.id === parseInt(req.params.showId) ||
    roleValues(req.user.role) >= roleValues('SECRETARY')
  ) {
    return next();
  }
  return res.status(403).send('Forbidden');
}

/**
 * Check if the show inscription is started
 * @author API ALCHEMISTS
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} show
 */
async function isShowInscriptionStarted(req, res, next) {
  try {
    if (req.params.showId === undefined) {
      return res.status(400).json({error: 'Show id is required'});
    }
    const show = await showById(parseInt(req.params.showId));
    if (show.inscription_start_date <= new Date()) {
      return res.status(403).json({error: 'Inscription already started'});
    }
    return next();
  } catch (error) {
    return res.status(404).json({error: error});
  }
}

/**
 * Check if the user is the same as the organizer or is an admin
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isOwnShowOrAdmin(req, res, next) {
  try {
    const show = await showById(parseInt(req.params.showId));
    if (
      req.user.id === show.organizer.id ||
      roleValues(req.user.role) >= roleValues('ADMIN')
    ) {
      return next();
    }
    return res.status(403).json({error: 'The user does not own the show.'});
  } catch (error) {
    return res.status(404).json({error: error});
  }
}

/**
 * Verify if the user is the organizer of the show or is
 * an admin or is the secretary
 * @author Nathan Lessard
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} error or next
 */
async function isOwnShowOrSecretary(req, res, next) {
  try {
    const show = await showAdminById(parseInt(req.params.showId));
    if (
      req.user.id === show.organizer.id ||
      roleValues(req.user.role) >= roleValues('ADMIN') ||
      req.user.id === show.secretary.id
    ) {
      return next();
    }
    return res
        .status(403)
        .json({error: 'The user is not part of the show organization.'});
  } catch (error) {
    return res.status(404).json({error: error});
  }
}

const validationPublish = {
  body: Joi.object({
    is_published: Joi.boolean().required(),
  }),
};

const validationShow = {
  body: Joi.object({
    name: Joi.string().required().regex(/^[\wÀ-ÿ'\-\s]+/),
    address_id: Joi.number().integer().required(),
    nb_total_place: Joi.number().integer().required(),
    nb_free_place: Joi.number().integer().required(),
    nb_temp_stalls: Joi.number().integer().required(),
    nb_tack_stalls: Joi.number().integer().required(),
    nb_free_temp_stalls: Joi.number().integer().required(),
    nb_free_tack_stalls: Joi.number().integer().required(),
    nb_free_permanent_stalls: Joi.number().integer().required(),
    nb_permanent_stalls: Joi.number().integer().required(),
    recognized_show: Joi.boolean().required(),
    rules: Joi.string().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    inscription_end_date: Joi.date().required(),
    inscription_end_late_date: Joi.date().optional(),
    inscription_start_date: Joi.date().required(),
    asked_codes: Joi.string().optional().regex(/[A-Za-z_0-9]+/),
    is_vaccination_proof_required: Joi.boolean().required(),
    is_coggins_proof_required: Joi.boolean().required(),
    show_logo: Joi.allow(null).optional(),
    // show fees
    hay: Joi.number().integer().required(),
    chiving: Joi.number().integer().required(),
    temp_stall_per_day: Joi.number().integer().required(),
    permanent_stall_per_day: Joi.number().integer().required(),
    tack_stall_per_day: Joi.number().integer().required(),
    drug_test: Joi.number().integer().required(),
    // admin fees
    administration: Joi.number().integer().required(),
    late_inscription: Joi.number().integer().required(),
    cancel_inscription: Joi.number().integer().required(),
    ground: Joi.number().integer().required(),
    paramedics: Joi.number().integer().required(),
    camper_ground_rental: Joi.number().integer().required(),
  }),
};

/**
 * Check if the fields of show are valid
 */
const validationShowMulter = Joi.object({
  name: Joi.string().required().regex(/^[\wÀ-ÿ'\-\s]*/),
  address_id: Joi.number().integer().required(),
  nb_total_place: Joi.number().integer().required(),
  nb_free_place: Joi.number().integer().required(),
  nb_temp_stalls: Joi.number().integer().required(),
  nb_tack_stalls: Joi.number().integer().required(),
  nb_free_temp_stalls: Joi.number().integer().required(),
  nb_free_tack_stalls: Joi.number().integer().required(),
  nb_free_permanent_stalls: Joi.number().integer().required(),
  nb_permanent_stalls: Joi.number().integer().required(),
  recognized_show: Joi.boolean().required(),
  rules: Joi.string().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  inscription_end_date: Joi.date().required(),
  inscription_end_late_date: Joi.date().optional(),
  inscription_start_date: Joi.date().required(),
  asked_codes: Joi.string().optional().regex(/[A-Za-z_0-9]*/),
  is_vaccination_proof_required: Joi.boolean().required(),
  is_coggins_proof_required: Joi.boolean().required(),
  show_logo: Joi.allow(null).optional(),
  // show fees
  hay: Joi.number().integer().required(),
  chiving: Joi.number().integer().required(),
  temp_stall_per_day: Joi.number().integer().required(),
  permanent_stall_per_day: Joi.number().integer().required(),
  tack_stall_per_day: Joi.number().integer().required(),
  drug_test: Joi.number().integer().required(),

  // admin fees
  administration: Joi.number().integer().required(),
  late_inscription: Joi.number().integer().required(),
  cancel_inscription: Joi.number().integer().required(),
  ground: Joi.number().integer().required(),
  paramedics: Joi.number().integer().required(),
  camper_ground_rental: Joi.number().integer().required(),
});

/**
 * Check if the fields of the modified show that is not published is valid
 */
const validationShowMulterModify = Joi.object({
  name: Joi.string().required().regex(/^[\wÀ-ÿ'\-\s]+/),
  address_id: Joi.number().integer().required(),
  nb_total_place: Joi.number().integer().required(),
  nb_temp_stalls: Joi.number().integer().required(),
  nb_tack_stalls: Joi.number().integer().required(),
  nb_permanent_stalls: Joi.number().integer().required(),
  recognized_show: Joi.boolean().required(),
  rules: Joi.string().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  inscription_end_date: Joi.date().required(),
  inscription_end_late_date: Joi.date().allow(null).allow('').optional(),
  inscription_start_date: Joi.date().required(),
  asked_codes: Joi.string().allow(null).allow('').optional()
      .regex(/[A-Za-z_0-9]*/),
  is_vaccination_proof_required: Joi.boolean().required(),
  is_coggins_proof_required: Joi.boolean().required(),
  show_logo: Joi.allow(null).optional(),
  // show fees
  hay: Joi.number().integer().required(),
  chiving: Joi.number().integer().required(),
  temp_stall_per_day: Joi.number().integer().required(),
  permanent_stall_per_day: Joi.number().integer().required(),
  tack_stall_per_day: Joi.number().integer().required(),
  drug_test: Joi.number().integer().required(),

  // admin fees
  administration: Joi.number().integer().required(),
  late_inscription: Joi.number().integer().required(),
  cancel_inscription: Joi.number().integer().required(),
  ground: Joi.number().integer().required(),
  paramedics: Joi.number().integer().required(),
  camper_ground_rental: Joi.number().integer().required(),
});

/**
 * Check if the fields of the modified show that is published is valid
 */
const validationPublishedShowMulter = Joi.object({
  nb_total_place: Joi.number().integer().required(),
  nb_temp_stalls: Joi.number().integer().required(),
  nb_tack_stalls: Joi.number().integer().required(),
  nb_permanent_stalls: Joi.number().integer().required(),
  rules: Joi.string().required(),
});

/**
 * Verify if multer threw an error about file size
 * and catches all the other uncaught errors
 * @param {*} error
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} error message or next
 */
async function verifyErrorFileSize(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res
          .status(400)
          .send({error: 'File size is too large. Maximum size is 5MB.'});
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res
          .status(400)
          .send({error: 'There can only be one file named show_logo.'});
    } else {
      return res.status(400).send({error: error.message});
    }
  } else if (error) {
    return res.status(400).send({error: error.message});
  } else {
    return next();
  }
}

/**
 * Verify if the inscription start date is in the future
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} error message or next
 */
async function isShowInscriptionStartInPast(req, res, next) {
  if (new Date(req.body.inscription_start_date) < new Date()) {
    return res
        .status(400)
        .json({error: 'The show inscription start date is in the past'});
  }
  return next();
}
/**
 * Check if the show is published
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} return error or next
 */
async function verifyShowPublished(req, res, next) {
  try {
    const show = await showByIdAllData(parseInt(req.params.showId));
    if (!show.is_published) {
      return res.status(400).json({error: 'Show is not published'});
    }

    return next();
  } catch (error) {
    return res.status(404).json({error: error});
  }
}

/**
 * Verify if the inscription end date is after the inscription start date
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} error message or next
 */
async function isShowInscriptionEndInPast(req, res, next) {
  if (req.body.inscription_end_date < req.body.inscription_start_date) {
    return res.status(400).json({
      error:
        'Inscription end date cannot be' + ' before inscription start date',
    });
  }
  return next();
}

/**
 * Verify if the late inscription date is after the inscription end date
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} error message or next
 */
async function isShowLateInscriptionEndAfterInscriptionEnd(req, res, next) {
  if (
    req.body.inscription_end_late_date &&
    req.body.inscription_end_late_date < req.body.inscription_end_date
  ) {
    return res.status(400).json({
      error: 'Late inscription date cannot be before' + ' inscription end date',
    });
  }
  return next();
}

/**
 * Verify if the show start date is before the inscription end late date if it
 * isn't null and if it is than it compares with the inscription end date
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} error message or next
 */
async function isShowStartAfterEndInscription(req, res, next) {
  if (
    req.body.start_date <
    (req.body.inscription_end_late_date ?? req.body.inscription_end_date)
  ) {
    return res.status(400).json({
      error:
        'Start date cannot be before inscription end date ' +
        'or inscription end late date',
    });
  }
  return next();
}

/**
 * Verify if the show end date is after the start date
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} error message or next
 */
async function isShowEndAfterStart(req, res, next) {
  if (req.body.end_date < req.body.start_date) {
    return res
        .status(400)
        .json({error: 'End date cannot be before start date'});
  }
  return next();
}

/**
 * Calls all the required validations for the show modification
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} error message or next
 */
async function validationShowModify(req, res, next) {
  const show = await showByIdAllData(parseInt(req.params.showId));

  if (show.is_published) {
    try {
      return await showPublishedValidation(req, res, next);
    } catch (error) {}
  } else {
    return await showNotPublishedValidation(req, res, next);
  }
}
/**
 * Calls the validations for if the show is started
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} error message or next
 */
async function showPublishedValidation(req, res, next) {
  const result = validationPublishedShowMulter.validate(req.body);
  if (result.error) {
    return res.status(400).json({error: result.error.details[0].message});
  }

  return await validationsShowPlaces(req, res, next);
}
/** *
 * Calls the validations for if there is enough space
 * in the show for the new space values
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} error message or next
 */
async function validationsShowPlaces(req, res, next) {
  const show = await showByIdAllData(parseInt(req.params.showId));
  if (show.nb_total_place - show.nb_free_place > req.body.nb_total_place) {
    return res.status(400).json({error: 'Not enough total place'});
  }
  if (
    show.nb_temp_stalls - show.nb_free_temp_stalls >
    req.body.nb_temp_stalls
  ) {
    return res.status(400).json({error: 'Not enough temp stalls'});
  }
  if (
    show.nb_tack_stalls - show.nb_free_tack_stalls >
    req.body.nb_tack_stalls
  ) {
    return res.status(400).json({error: 'Not enough tack stalls'});
  }
  if (
    show.nb_permanent_stalls - show.nb_free_permanent_stalls >
    req.body.nb_permanent_stalls
  ) {
    return res.status(400).json({error: 'Not enough permanent stalls'});
  }
  return next();
}

/**
 * The validations that are needed if the show hasn't started yet
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 */
async function showNotPublishedValidation(req, res, next) {
  const result = validationShowMulterModify.validate(req.body);
  if (result.error) {
    return res.status(400).json({error: result.error.details[0].message});
  }

  return await showDatesValdation(req, res, async () => {
    return await askedCodeUnique(req, res, async () => {
      return await validationsShowPlaces(req, res, async () => {
        return await isAddressExistWithShowOrganizerId(req, res, next);
      });
    });
  });
}

/**
 * Calls all the date validations for the show
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} error message or next
 */
async function showDatesValdation(req, res, next) {
  return await isShowInscriptionStartInPast(req, res, async () => {
    return await isShowInscriptionEndInPast(req, res, async () => {
      return await isShowLateInscriptionEndAfterInscriptionEnd(
          req,
          res,
          async () => {
            return await isShowStartAfterEndInscription(req, res, async () => {
              return await isShowEndAfterStart(req, res, next);
            });
          },
      );
    });
  });
}

/**
 * Calls all the date validations for the show when there is an image
 * @param {json} data
 * @return {Promise<*>} an array of error messages or undefined
 */
async function showDatesValdationMulter(data) {
  const inscriptionStartDateValidation =
    await isShowInscriptionStartInPastMulter(data);
  const inscriptionEndDateValidation = await isShowInscriptionEndInPastMulter(
      data,
  );
  const inscriptionEndLateDateValidation =
    await isShowLateInscriptionEndAfterInscriptionEndMulter(data);
  const showStartDateValidation = await isShowStartAfterEndInscriptionMulter(
      data,
  );
  const showEndDateValidation = await isShowEndAfterStartMulter(data);

  return [
    inscriptionStartDateValidation,
    inscriptionEndDateValidation,
    inscriptionEndLateDateValidation,
    showStartDateValidation,
    showEndDateValidation,
  ];
}

/**
 * Verify if the start date is in the future when there is an image
 * @param {json} data
 * @return {Promise<*>} error message or undefined
 */
async function isShowInscriptionStartInPastMulter(data) {
  if (new Date(data.inscription_start_date) < new Date()) {
    return 'The show inscription start date is in the past';
  }
  return undefined;
}

/**
 * Verify if the end date is after the inscription start date
 * when there is an image
 * @param {json} data
 * @return {Promise<*>} error message or undefined
 */
async function isShowInscriptionEndInPastMulter(data) {
  if (data.inscription_end_date < data.inscription_start_date) {
    return 'End date cannot be before start date';
  }
  return undefined;
}

/**
 * Verify if the late inscription date is after the inscription end date
 * when there is an image
 * @param {json} data
 * @return {Promise<*>} error message or undefined
 */
async function isShowLateInscriptionEndAfterInscriptionEndMulter(data) {
  if (
    data.inscription_end_late_date &&
    data.inscription_end_late_date < data.inscription_end_date
  ) {
    return 'Late inscription date cannot be before end date';
  }
  return undefined;
}

/**
 * Verify if the showw start date is before the inscription end late date if it
 * isn't null and if it is than it compare with the inscription end date
 * when there is an image
 *
 * @param {json} data
 * @return {Promise<*>} error message or undefined
 */
async function isShowStartAfterEndInscriptionMulter(data) {
  if (
    data.start_date <
    (data.inscription_end_late_date ?? data.inscription_end_date)
  ) {
    return 'Start date cannot be before inscription end date';
  }
  return undefined;
}

/**
 * Verify if the show end date is after the start date
 * when there is an image
 * @param {json} data
 * @return {Promise<*>} error message or undefined
 */
async function isShowEndAfterStartMulter(data) {
  if (data.end_date < data.start_date) {
    return 'End date cannot be before start date';
  }
  return undefined;
}

/** *
 * Calls the validations for if there is enough space
 * in the show for the new space values
 * when there is an image
 * @param {string} show_id
 * @param {json} data
 * @return {Promise<*>} error message or undefined
 */
async function validationsShowPlacesMulter(show_id, data) {
  const show = await showByIdAllData(parseInt(show_id));
  if (show.nb_total_place - show.nb_free_place > data.nb_total_place) {
    return 'Not enough place';
  }
  if (show.nb_temp_stalls - show.nb_free_temp_stalls > data.nb_temp_stalls) {
    return 'Not enough temp stalls';
  }
  if (show.nb_tack_stalls - show.nb_free_tack_stalls > data.nb_tack_stalls) {
    return 'Not enough tack stalls';
  }
  if (
    show.nb_permanent_stalls - show.nb_free_permanent_stalls >
    data.nb_permanent_stalls
  ) {
    return 'Not enough permanent stalls';
  }
  return undefined;
}

/**
 * Verify if the asked codes are unique when there is an image
 * when there is an image
 * @param {json} data
 * @return {Promise<*>} error message or undefined
 */
async function askedCodeUniqueMulter(data) {
  if (data.asked_codes !== undefined && data.asked_codes !== '') {
    const asked_codes_array = data.asked_codes
        .split(',')
        .map((code) => code.trim())
        .filter((code) => code.trim() !== '');
    if (asked_codes_array.length !== new Set(asked_codes_array).size) {
      return 'Asked codes must be unique';
    }
  }
  return undefined;
}

/**
 * Verify if the asked codes are unique when there isn't an image
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} error message or next
 */
async function askedCodeUnique(req, res, next) {
  if (req.body.asked_codes !== undefined && req.body.asked_codes !== '') {
    const asked_codes_array = req.body.asked_codes
        .split(',')
        .map((code) => code.trim())
        .filter((code) => code.trim() !== '');
    if (asked_codes_array.length !== new Set(asked_codes_array).size) {
      return res.status(400).json({error: 'Asked codes must be unique'});
    }
  }
  return next();
}

/**
 * Check if organizer has enough remaining shows
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} error message or next
 */
async function hasEnoughRemainingShows(req, res, next) {
  if (req.user.role === 'ADMIN') {
    return next();
  }

  const organizerShows = await prisma.organizerShows.findUnique({
    where: {
      user_id: req.user.id,
    },
  });

  if (
    organizerShows === null ||
    organizerShows === undefined ||
    organizerShows.remaining_shows <= 0
  ) {
    return res.status(400).json({
      message: 'The organizer has no remaining shows',
    });
  }

  return next();
}

/**
 * Verify if the show is published
 * @author Nathan Lessard
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} show
 */
async function isShowPublished(req, res, next) {
  try {
    const show = await showAdminById(parseInt(req.params.showId));

    if (!show.is_published) {
      return next();
    }
    return res.status(400).json({error: 'Show is already published'});
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * check if the show is published for client side
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} error message or next
 */
async function isShowPublishedClient(req, res, next) {
  try {
    const show = await getShowIsPublised(parseInt(req.params.showId));

    return show.is_published ?
      next() :
      res.status(404).json({error: 'La ressource n’existe pas.'});
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Verifies the file type of the show logo
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {json} error message or next
 */
async function verifyImage(req, res, next) {
  const whitelist = [
    'image/png',
    'image/jpeg',
    'image/jpg',
  ];

  try {
    if (req.files['show_logo'] !== undefined &&
     req.files['show_logo'] !== null) {
      const meta =
      await FileType.fromFile(req.files['show_logo'][0].path);
      if (meta && !whitelist.includes(meta.mime)) {
        deleteFileDoc(req.files['show_logo'][0].path);

        return res.status(400).json(
            {error: 'Invalid file type. Only JPEG and PNG files are allowed.'});
      } else if (meta === undefined) {
        deleteFileDoc(req.files['show_logo'][0].path);

        return res.status(400).json(
            {error: 'Invalid file type. Only JPEG and PNG files are allowed.'});
      }
    }
    return next();
  } catch (error) {

  }
}

module.exports = {
  isShowExists,
  isShowInscriptionStarted,
  validationShow,
  isSameOrganizer,
  isOrganizerOwnsShow,
  validationShowMulter,
  verifyErrorFileSize,
  showDatesValdation,
  validationShowModify,
  showDatesValdationMulter,
  validationsShowPlacesMulter,
  validationShowMulterModify,
  askedCodeUniqueMulter,
  isOwnShowOrAdmin,
  hasEnoughRemainingShows,
  isShowPublished,
  validationPublish,
  verifyShowPublished,
  isOwnShowOrSecretary,
  isShowPublishedClient,
  verifyImage,
};
