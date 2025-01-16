const express = require('express');
const {validate} = require('express-validation');
const router = express.Router({mergeParams: true});
const multer = require('multer');
const {showByIdAllData} = require('../services/shows.service.js');
const ShowsController = require('../controllers/shows.controller.js');
const {v4: uuidv4} = require('uuid');

const {
  isShowExists,
  isShowInscriptionStarted,
  validationShow,
  validationShowMulter,
  validationShowMulterModify,
  validationShowModify,
  verifyErrorFileSize,
  showDatesValdation,
  showDatesValdationMulter,
  validationsShowPlacesMulter,
  askedCodeUniqueMulter,
  hasEnoughRemainingShows,
  validationPublish,
  verifyImage,
  isOwnShowOrSecretary,
  isSameOrganizer,
  isShowPublishedClient,
} = require('../middlewares/validations/shows.validation.js');
const {
  isAddressExist,
  isAddressExistMulter,
} = require('../middlewares/validations/addresses.validation.js');
const {
  useAuth,
  isSameOrganizerOrAdmin,
  isOrganizerOrMore,
  isSecretaryOrMore,
  isOrganizer,
} = require('../middlewares/validations/auth.validation.js');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'src/public/documents');
  },
  filename: function(req, file, cb) {
    cb(
        null,
        file.fieldname + '-' +
        uuidv4() + '-' +
        Date.now() + '.' +
        file.mimetype.split('/')[1],
    );
  },
});

const fileFilter = async (req, file, cb) => {
  const result = validationShowMulter.validate(req.body);
  const validationAddress = await isAddressExistMulter(
      req.user.id,
      req.body.address_id,
  );
  if (result.error == undefined && validationAddress == undefined) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(
          new Error('Invalid file type. Only JPEG and PNG files are allowed.'),
          false,
      );
    }
  } else {
    const errorMessages = [
      result.error ? result.error.details[0].message : null,
      validationAddress,
    ].filter((message) => message !== null && message !== undefined);

    req.res.status(400).json({
      errorMessage: errorMessages,
    });
  }
};

const fileFilterPutShow = async (req, file, cb) => {
  const show = await showByIdAllData(parseInt(req.params.showId));
  let resultValidationData;
  let validationAddress;
  let validationDate = [];
  let isPublishedValidation;
  let validationsShowPlaces;
  let validationAskedCode;
  if (show.is_published) {
    // i am not verifying anything since if it enters here it means there
    // is a show_logo which is not allowed for a published show
    isPublishedValidation = 'Changing Logo is not allowed for a published show';
  } else {
    resultValidationData = validationShowMulterModify.validate(req.body);
    validationDate = await showDatesValdationMulter(req.body);
    validationAddress = await isAddressExistMulter(
        req.user.id,
        req.body.address_id,
    );
    validationsShowPlaces = await validationsShowPlacesMulter(
        req.params.showId,
        req.body,
    );
    validationAskedCode = await askedCodeUniqueMulter(req.body);
  }

  const errorMessages = [
    resultValidationData && resultValidationData.error ?
      resultValidationData.error.details[0].message :
      null,
    validationAddress,
    ...validationDate,
    isPublishedValidation,
    validationsShowPlaces,
    validationAskedCode,
  ].filter((message) => message !== null && message !== undefined);

  if (errorMessages.length == 0) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(
          new Error('Invalid file type. Only JPEG and PNG files are allowed.'),
          false,
      );
    }
  } else {
    req.res.status(400).json({
      errorMessage: errorMessages,
    });
  }
};

const uploadPostShow = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const uploadPutShow = multer({
  storage: storage,
  fileFilter: fileFilterPutShow,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const docFilesPostShow = uploadPostShow.fields([
  {name: 'show_logo', maxCount: 1},
]);

const docFilesPutShow = uploadPutShow.fields([
  {name: 'show_logo', maxCount: 1},
]);

router.get('/', ShowsController.notLoggedShows);
router.get('/loggedUserShows', useAuth, ShowsController.findAll);

router.get(
    '/adminShows',
    useAuth,
    isSecretaryOrMore,
    ShowsController.getAdminShows,
);

router.get(
    '/:showId',
    useAuth,
    isShowExists,
    isShowPublishedClient,
    ShowsController.getShowById,
);

router.get(
    '/notLoggedDetails/:showId',
    isShowExists,
    isShowPublishedClient,
    ShowsController.getShowByIdNotLogged,
);

router.get(
    '/adminShows/:showId',
    useAuth,
    isSecretaryOrMore,
    isOwnShowOrSecretary,
    isShowExists,
    ShowsController.getShowAdminById,
);

router.get(
    '/adminShows/:showId/classes/date/:dateToCheck',
    useAuth,
    isOrganizerOrMore,
    isShowExists,
    ShowsController.getShowAdminClassesByDate,
);

router.post(
    '/',
    useAuth,
    isOrganizer,
    hasEnoughRemainingShows,
    // TODO: TO TEST, remove comment and import from organizers.validation.js
    // isOrganizerStripeConnected,
    docFilesPostShow,
    verifyErrorFileSize,
    verifyImage,
    validate(validationShow, {}, {}),
    showDatesValdation,
    isAddressExist,
    ShowsController.postShow,
);

router.put(
    '/:showId',
    useAuth,
    isOrganizerOrMore,
    isSameOrganizer,
    isShowExists,
    docFilesPutShow,
    verifyErrorFileSize,
    verifyImage,
    validationShowModify,
    ShowsController.updateShowById,
);

router.patch(
    '/:showId/publish',
    useAuth,
    isOrganizer,
    isSameOrganizer,
    isShowExists,
    isShowInscriptionStarted,
    validate(validationPublish, {}, {}),
    ShowsController.publishShow,
);

router.delete(
    '/:showId',
    useAuth,
    isOrganizerOrMore,
    isSameOrganizer,
    isShowExists,
    isShowInscriptionStarted,
    ShowsController.deleteShowById,
);

router.get(
    '/:showId/inscriptions',
    useAuth,
    isShowExists,
    isSameOrganizerOrAdmin,
    ShowsController.getShowInscriptions,
);

module.exports = router;
