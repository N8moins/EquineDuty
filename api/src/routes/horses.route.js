const express = require('express');
const {postHorse, deleteHorse, putHorse, getHorse, getHorses} =
 require('../controllers/horses.controller.js');
const {validate} = require('express-validation');
const {multerValidationHorses, validationHorse, isHorseExists,
  verifyHorseDoc, verifyErrorFileSizeHorse} =
  require('../middlewares/validations/horses.validation.js');
const router = express.Router({mergeParams: true});
const multer = require('multer');
const {v4: uuidv4} = require('uuid');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'src/public/documents');
  },
  filename: function(req, file, cb) {
    cb(null,
        file.fieldname + '-' +
        uuidv4() + '-' +
        Date.now() + '.' +
        file.mimetype.split('/')[1]);
  },
});

const fileFilter = (req, file, cb) => {
  const result = multerValidationHorses.validate(req.body);
  if (result.error == null) {
    if (file.mimetype === 'image/jpeg' ||
     file.mimetype === 'image/png' ||
     file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error(
          'Invalid file type. Only JPEG, PNG and PDF files are allowed.'),
      false);
    }
  } else {
    req.res.status(400).send(result.error.details);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});

const docFiles = upload.fields([{name: 'vaccine', maxCount: 1},
  {name: 'coggins', maxCount: 1}]);

router.get('/',
    getHorses);

router.get('/:horseId',
    isHorseExists,
    getHorse);

router.post('/',
    docFiles,
    verifyErrorFileSizeHorse,
    verifyHorseDoc,
    validate(validationHorse, {}, {}),
    postHorse);

router.put('/:horseId',
    isHorseExists,
    docFiles,
    verifyErrorFileSizeHorse,
    verifyHorseDoc,
    validate(validationHorse, {}, {}),
    putHorse);

router.delete('/:horseId',
    isHorseExists,
    deleteHorse);

module.exports = router;


