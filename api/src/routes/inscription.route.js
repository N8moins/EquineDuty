const express = require('express');
const router = express.Router({mergeParams: true});
const {validate} = require('express-validation');

const {isClassExists, isClassInShow} =
    require('../middlewares/validations/classes.validation.js');
const {isShowExists, verifyShowPublished} =
    require('../middlewares/validations/shows.validation.js');

const {
  validationInscription,
  validationApproval,
  isHorseExistsBody,
  isRiderExistsBody,
  isIncriptionExists,
  isInscriptionDate,
  isShowWithinDaysLimit,
  isNbDayWithNbStallOrStack,
} = require('../middlewares/validations/inscriptions.validation.js');
const {isSameOrganizerOrAdmin
  , isOrganizerOrMore, useAuth} =
  require('../middlewares/validations/auth.validation.js');
const {
  postInscription,
  patchInscription,
  getInscription,
} = require('../controllers/inscriptions.controller.js');
const {isBundleArrayExistsOrIsUndefined, areBundleIdUnique} =
require('../middlewares/validations/bundles.validation.js');

router.post('/',
    validate(validationInscription, {}, {}),
    isNbDayWithNbStallOrStack,
    isHorseExistsBody,
    isRiderExistsBody,
    isShowExists,
    verifyShowPublished,
    isShowWithinDaysLimit,
    isClassExists,
    isClassInShow,
    isInscriptionDate,
    areBundleIdUnique,
    isBundleArrayExistsOrIsUndefined,
    postInscription);

router.patch('/:inscriptionId',
    isOrganizerOrMore,
    isSameOrganizerOrAdmin,
    validate(validationApproval, {}, {}),
    isIncriptionExists,
    patchInscription);

router.get('/:inscriptionId',
    useAuth,
    isIncriptionExists,
    getInscription,
);


module.exports = router;
