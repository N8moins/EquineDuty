const express = require('express');
const router = express.Router({mergeParams: true});
const {putPasswordAndPutVerif} =
    require('../controllers/rolesPassword.controller.js');
const {validate} = require('express-validation');
const {
  validationPassword,
} = require('../middlewares/validations/users.validation.js');

router.put('/', validate(validationPassword, {}, {}),
    putPasswordAndPutVerif);

module.exports = router;
