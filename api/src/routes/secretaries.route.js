const express = require('express');
const router = express.Router({mergeParams: true});
const {postSecretary, removeSecretaryRole} =
    require('../controllers/secretaries.controller.js');
const {validationSecretary, isOrganizerOwnShowOrAdmin,
  isSecretaryShowSecretaryId} =
  require('../middlewares/validations/secretaries.validation.js');
const {validate} = require('express-validation');
const {isOrganizerOwnsShow} =
    require('../middlewares/validations/shows.validation.js');

router.post('/', isOrganizerOwnsShow,
    validate(validationSecretary, {}, {}), postSecretary);

router.delete('/', isOrganizerOwnShowOrAdmin, isSecretaryShowSecretaryId,
    removeSecretaryRole);

module.exports = router;
