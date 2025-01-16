const express = require('express');
const router = express.Router({mergeParams: true});
module.exports = router;

const {
  connectStripe,
  webhook,
} = require('../controllers/stripe.controller.js');
const {
  useAuth,
  isOrganizer,
  isSameUser,
} = require('../middlewares/validations/auth.validation.js');

router.post('/webhook', webhook);

router.post('/organizers/:userId/connect',
    useAuth,
    isOrganizer,
    isSameUser,
    connectStripe,
);
