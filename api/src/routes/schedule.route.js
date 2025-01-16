const express = require('express');

const {validate} = require('express-validation');
const {
  validationSchedule,
  checkMinutesRiders,
  checkMinutesHorses,
} = require('../middlewares/validations/schedule.validation.js');

const {
  postSchedule,
  confirmSchedule,
} = require('../controllers/schedule.controller.js');

const router = express.Router({mergeParams: true});

router.post('/', postSchedule);

router.post(
    '/date/:date/confirmSchedule',
    validate(validationSchedule, {}, {}),
    checkMinutesRiders,
    checkMinutesHorses,
    confirmSchedule,
);

module.exports = router;
