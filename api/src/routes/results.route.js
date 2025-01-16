const express = require('express');
const {getResults, postResults,
  getResultByJudgeAndRider, deleteResultByJudgeAndRider} =
    require('../controllers/results.controller.js');
const {isTestExists} =
    require('../middlewares/validations/tests.validation.js');
const {isJudgeExists} =
    require('../middlewares/validations/classes.validation.js');
const {isRiderExists} =
    require('../middlewares/validations/riders.validation.js');
const {isEntryNumberExistsBody} =
    require('../middlewares/validations/inscriptions.validation.js');
const {validate} = require('express-validation');
const {validationResult, isResultsExist, isResultsAlreadyExists} =
    require('../middlewares/validations/results.validation.js');
const {isSecretaryOrMore, useAuth} =
    require('../middlewares/validations/auth.validation.js');
const {isShowExists} =
    require('../middlewares/validations/shows.validation.js');

const router = express.Router({mergeParams: true});

router.get('/shows/:showId', isShowExists, getResults);

router.post('/tests/:testId/riders/:riderId/judges/:judgeId',
    validate(validationResult, {}, {}),
    isTestExists, isRiderExists, isResultsAlreadyExists,
    isJudgeExists, isEntryNumberExistsBody, postResults);

router.get('/tests/:testId/riders/:riderId/judges/:judgeId',
    isTestExists, isRiderExists,
    isResultsExist, isJudgeExists, getResultByJudgeAndRider);

router.delete('/tests/:testId/riders/:riderId/judges/:judgeId',
    isTestExists, isRiderExists,
    isResultsExist, isJudgeExists, deleteResultByJudgeAndRider);

// router.put('/test/:testId/rider/:riderId',
// validate(validationResult, {}, {}),
//  isTestExists, isRiderExists, isResultsExist, putResults);

module.exports = router;
