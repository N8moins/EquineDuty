const express = require('express');
const {validate} = require('express-validation');

const {validationClasses, isClassExists,
  isClassInStartedInscriptionOfShow, isClassInShow} =
    require('../middlewares/validations/classes.validation.js');
const {postClass, putClass, deleteClass,
  getClasses, getById, getJudges} =
    require('../controllers/classes.controller.js');
const {isSameOrganizerOrAdmin} =
require('../middlewares/validations/auth.validation.js');
const router = express.Router({mergeParams: true});
const {isSameOrganizer, isOrganizerOwnsShow} =
require('../middlewares/validations/shows.validation.js');
const {isTestExistsBody} =
    require('../middlewares/validations/tests.validation.js');
const {getRidersClass} =
    require('../controllers/riders.controller.js');

router.get('/',
    isSameOrganizer,
    getClasses);

router.get('/:classId', isSameOrganizerOrAdmin, getById);

router.get('/:classId/riders', isClassInShow,
    isOrganizerOwnsShow, getRidersClass);

router.get('/:classId/judges', isClassInShow, getJudges);


router.post('/', validate(validationClasses, {}, {}),
    isTestExistsBody,
    postClass);

router.put('/:classId',
    validate(validationClasses, {}, {}),
    isClassExists,
    isClassInStartedInscriptionOfShow,
    isTestExistsBody,
    putClass);

router.delete('/:classId',
    isClassExists,
    isClassInStartedInscriptionOfShow,
    deleteClass);

module.exports = router;
