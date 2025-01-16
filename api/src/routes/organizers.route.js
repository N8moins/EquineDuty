const express = require('express');
const router = express.Router({mergeParams: true});
const {postOrganizers} =
    require('../controllers/organizers.controller.js');
const {validationOrganizer} =
  require('../middlewares/validations/organizers.validation.js');
const {validate} = require('express-validation');


router.post('/', validate(validationOrganizer, {}, {}), postOrganizers);

module.exports = router;
