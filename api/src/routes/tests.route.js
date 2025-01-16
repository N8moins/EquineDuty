const express = require('express');
const {getTest, postTests, linkTestToClass, getTestsFromUserId,
  deleteTest, putTest} = require('../controllers/tests.controller.js');
const router = express.Router({mergeParams: true});
const {validate} = require('express-validation');
const {validationTests, isUserOwnsTest,
  isTestExists, isCountOfMarksTypeIsMoreThenTests} =
    require('../middlewares/validations/tests.validation.js');

router.get('/', getTestsFromUserId);

router.get('/:testId', getTest);

router.post('/', validate(validationTests, {}, {}),
    isCountOfMarksTypeIsMoreThenTests, postTests);

router.delete('/:testId', isTestExists, isUserOwnsTest, deleteTest);

router.put('/:testId', validate(validationTests, {}, {}),
    isTestExists, isUserOwnsTest, isCountOfMarksTypeIsMoreThenTests, putTest);

router.put('/:testId/class/:classId', linkTestToClass);


module.exports = router;
