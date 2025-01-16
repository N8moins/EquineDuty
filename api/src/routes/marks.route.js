const express = require('express');
const {postMarks} = require('../controllers/marks.controller.js');
const router = express.Router({mergeParams: true});
const {validate} = require('express-validation');
const {validationMarks} =
    require('../middlewares/validations/marks.validation.js');

router.post('/:testId/mark',
    validate(validationMarks, {}, {}), postMarks);

module.exports = router;
