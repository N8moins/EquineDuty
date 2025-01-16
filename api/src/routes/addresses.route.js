const express = require('express');
const router = express.Router({mergeParams: true});
const {postAddress, getAddressesByUserId} =
require('../controllers/addresses.controller.js');
const {addressValidation} =
    require('../middlewares/validations/addresses.validation.js');
const {validate} = require('express-validation');
const {isSameUser} =
    require('../middlewares/validations/auth.validation.js');

router.get('/',
    isSameUser,
    getAddressesByUserId);

router.post('/',
    validate(addressValidation, {}, {}), postAddress);

module.exports = router;
