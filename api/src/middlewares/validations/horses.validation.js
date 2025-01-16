const {Joi} = require('express-validation');
const {getHorseById} = require('../../services/horses.service.js');
const FileType = require('file-type');
const {deleteFileDoc} = require('../../controllers/shows.controller.js');
const multer = require('multer');


/**
 * Validations for horse
 */
const multerValidationHorses = Joi.object({
  name: Joi.string().required().regex(/^[a-zA-Z0-9]+$/),
  sex: Joi.string().required()
      .pattern(/gelding|stallion|mare|colt|filly/),
  no_fei: Joi.string().length(8).pattern(/^\d+$/).optional(),
  no_micro_chip: Joi.string().optional().regex(/[0-9]*/).max(15),
  vaccine: Joi.optional(),
  coggins: Joi.optional(),
  email_owner: Joi.string().email().required().max(255),
  fei_owner: Joi.string().length(8).pattern(/^\d+$/).optional(),
  name_owner: Joi.string().required()
      .regex(/^[\wÀ-ÿ'-]+(?:\s[\wÀ-ÿ'-]+)*\s[\wÀ-ÿ'-]+$/),
  phone_owner: Joi.string().required()
  // eslint-disable-next-line max-len
      .regex(/^(1( |-|))?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/),
});

const validationHorse = {
  body: Joi.object({
    name: Joi.string().required().regex(/^[a-zA-Z0-9]+$/),
    sex: Joi.string().required()
        .pattern(/gelding|stallion|mare|colt|filly/),
    no_fei: Joi.string().length(8).pattern(/^\d+$/).optional(),
    no_micro_chip: Joi.string().optional().regex(/[0-9]*/).max(15),
    vaccine: Joi.optional(),
    coggins: Joi.optional(),
    email_owner: Joi.string().email().required().max(255),
    fei_owner: Joi.string().length(8).regex(/^\d+$/).optional(),
    name_owner: Joi.string().required()
        .regex(/^[\wÀ-ÿ'-]+(?:\s[\wÀ-ÿ'-]+)*\s[\wÀ-ÿ'-]+$/),
    phone_owner: Joi.string().required()
    // eslint-disable-next-line max-len
        .regex(/^(1( |-|))?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/),
  }),
};

/**
 * Check if horse exists
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next function
 * @return {Promise<*>} horse
 */
async function isHorseExists(req, res, next) {
  try {
    const horse = await getHorseById(parseInt(req.params.horseId));
    if (!horse) {
      return res.status(404).json({error: 'Horse id not found'});
    }

    return next();
  } catch (error) {
    return res.status(404).json({error: 'Horse id not found'});
  }
}


/**
 * Verifies the file type of the documents of the horse
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {json} error message or next
 */
async function verifyHorseDoc(req, res, next) {
  const whitelist = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
  ];

  try {
    if (req.files['vaccine'] !== undefined &&
    req.files['vaccine'] !== null) {
      const meta =
      await FileType.fromFile(req.files['vaccine'][0].path);
      if (meta && !whitelist.includes(meta.mime)) {
        deleteFileDoc(req.files['vaccine'][0].path);
        if (req.files['coggins'] !== undefined &&
        req.files['coggins'] !== null) {
          deleteFileDoc(req.files['coggins'][0].path);
        }
        return res.status(400).json(
            {error: 'Invalid file type. Only JPEG and PNG files are allowed.'});
      } else if (meta === undefined) {
        deleteFileDoc(req.files['vaccine'][0].path);
        if (req.files['coggins'] !== undefined &&
        req.files['coggins'] !== null) {
          deleteFileDoc(req.files['coggins'][0].path);
        }
        return res.status(400).json(
            {error: 'Invalid file type. Only JPEG and PNG files are allowed.'});
      }
    }

    if (req.files['coggins'] !== undefined &&
    req.files['coggins'] !== null) {
      const meta =
      await FileType.fromFile(req.files['coggins'][0].path);
      if (meta && !whitelist.includes(meta.mime)) {
        deleteFileDoc(req.files['coggins'][0].path);
        if (req.files['vaccine'] !== undefined &&
        req.files['vaccine'] !== null) {
          deleteFileDoc(req.files['vaccine'][0].path);
        }
        return res.status(400).json(
            {error: 'Invalid file type. Only JPEG and PNG and PDF' +
             ' files are allowed.'});
      } else if (meta === undefined) {
        deleteFileDoc(req.files['coggins'][0].path);
        if (req.files['vaccine'] !== undefined &&
        req.files['vaccine'] !== null) {
          deleteFileDoc(req.files['vaccine'][0].path);
        }
        return res.status(400).json(
            {error: 'Invalid file type. Only JPEG and PNG files' +
             ' and PDF are allowed.'});
      }
    }
    return next();
  } catch (error) {
    console.error('Error loading module:', error);
  }
}

/**
 * Verify if multer threw an error about file size
 *  and catches all the other uncaught error
 * @param {*} error
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} error message or next
 */
async function verifyErrorFileSizeHorse(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res
          .status(400)
          .send({error: 'File size is too large. Maximum size is 2MB.'});
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res
          .status(400)
          .send({error: 'There can only be one file for each image field.'});
    } else {
      return res.status(400).send({error: error.message});
    }
  } else if (error) {
    return res.status(400);
  } else {
    return next();
  }
}


module.exports = {
  isHorseExists,
  validationHorse,
  multerValidationHorses,
  verifyHorseDoc,
  verifyErrorFileSizeHorse,
};
