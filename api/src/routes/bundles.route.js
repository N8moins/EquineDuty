const express = require('express');
const {validate} = require('express-validation');
const router = express.Router({mergeParams: true});
const {postBundle, getBundles} =
    require('../controllers/bundles.controller.js');
const {validationBundles, isBundleStallsAreMoreThenShowStalls} =
    require('../middlewares/validations/bundles.validation');
const {isOrganizerOwnsShow, isShowExists} =
    require('../middlewares/validations/shows.validation.js');
const {isOrganizerOrMore} =
require('../middlewares/validations/auth.validation.js');

router.get('/', isShowExists, getBundles);

router.post('/', validate(validationBundles, {}, {}), isOrganizerOrMore,
    isOrganizerOwnsShow, isBundleStallsAreMoreThenShowStalls, postBundle);

module.exports = router;
