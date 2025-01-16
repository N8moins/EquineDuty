const express = require('express');
const router = express.Router({mergeParams: true});

const {
  getInscriptions, getDetailedReceipt,
} = require('../controllers/inscriptions.controller.js');
const {isIncriptionExists, isUserAssociatedWithInscription} =
require('../middlewares/validations/inscriptions.validation.js');

router.get('/', getInscriptions);

router.get('/:inscriptionId/receipt',
    isIncriptionExists,
    isUserAssociatedWithInscription,
    getDetailedReceipt);

module.exports = router;
