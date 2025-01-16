const express = require('express');
const {validate} = require('express-validation');

const {postRider, putRider, getRider, getRiders, deleteRider} =
    require('../controllers/riders.controller.js');
const {validationRider, isRiderExists} =
    require('../middlewares/validations/riders.validation.js');

const {isRiderRegisteredAndPayedInUncompletedShow} =
    require('../middlewares/isRegisteredInShow.js');

const router = express.Router({mergeParams: true});

router.get('/', getRiders);

router.get('/:riderId', isRiderExists, getRider);

router.post('/', validate(validationRider, {}, {}), postRider);

router.put('/:riderId',
    validate(validationRider, {}, {}),
    isRiderExists,
    isRiderRegisteredAndPayedInUncompletedShow,
    putRider);

router.delete('/:riderId',
    isRiderExists,
    isRiderRegisteredAndPayedInUncompletedShow,
    deleteRider);


module.exports = router;
