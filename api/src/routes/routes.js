const express = require('express');
const ridersRoutes = require('./riders.route.js');
const markRoutes = require('./marks.route.js');
const horsesRoute = require('./horses.route.js');
const testsRoutes = require('./tests.route.js');
const showsRoutes = require('./shows.route.js');
const classesRoutes = require('./classes.route.js');
const authRoutes = require('./auth.route.js');
const addressRoutes = require('./addresses.route.js');
const resultsRoutes = require('./results.route.js');
const organizersRoutes = require('./organizers.route.js');
const secretariesRoutes = require('./secretaries.route.js');
const inscriptionsUsersRoutes = require('./inscriptions.users.route.js');
const rolesRoutesPass = require('./roles.password.route.js');
const inscriptionRoutes = require('./inscription.route.js');
const bundlesRoutes = require('./bundles.route.js');
const usersRoutes = require('./users.route.js');
const scheduleRoutes = require('./schedule.route.js');
const stripeRoutes = require('./stripe.route.js');
const contactsRoutes = require('./contact.route.js');
const {isUserExist} = require('../middlewares/isUserExist.validation.js');

const {
  isShowExists,
  isSameOrganizer,
  isOwnShowOrAdmin,
} = require('../middlewares/validations/shows.validation.js');
const {
  isClassExists,
} = require('../middlewares/validations/classes.validation.js');

const {payInscription} = require('../controllers/stripe.controller.js');

const {
  useAuth,
  isSecretaryOrMore,
  isOrganizerOrMore,
  isAdmin,
  isSameUserOrAdmin,
  useAuthNotVerified,
} = require('../middlewares/validations/auth.validation.js');
const {
  isUserIncriptionExists,
} = require('../middlewares/validations/inscriptions.validation.js');

const router = express.Router({mergeParams: true});

router.use('/users',
    useAuth,
    usersRoutes);

router.use('/users/:userId/horses',
    useAuth,
    isUserExist,
    isSameUserOrAdmin,
    horsesRoute,
);

router.use(
    '/users/:userId/riders',
    useAuth,
    isUserExist,
    isSameUserOrAdmin,
    ridersRoutes,
);

router.use('/users/:userId/test',
    useAuth,
    isOrganizerOrMore,
    markRoutes);

router.use(
    '/users/:userId/address',
    useAuth,
    isUserExist,
    isOrganizerOrMore,
    addressRoutes,
);

router.use(
    '/users/:userId/tests',
    useAuth,
    isUserExist,
    isSameUserOrAdmin,
    testsRoutes);

router.use(
    '/shows/:showId/classes/:classId/inscriptions',
    useAuth,
    isClassExists,
    isShowExists,
    inscriptionRoutes,
);

router.use('/users/:userId/inscriptions',
    useAuth,
    isUserExist,
    isSameUserOrAdmin,
    inscriptionsUsersRoutes);

router.use('/shows', showsRoutes);

router.use('/organizers', useAuth, isAdmin, organizersRoutes);

router.use(
    '/shows/:showId/secretaries',
    useAuth,
    isShowExists,
    isOrganizerOrMore,
    secretariesRoutes,
);

router.use(
    '/shows/:showId/schedule',
    useAuth,
    isOrganizerOrMore,
    isOwnShowOrAdmin,
    scheduleRoutes,
);

router.use(
    '/resetpassword',
    useAuthNotVerified,
    isSecretaryOrMore,
    rolesRoutesPass,
);
router.use('/shows/:showId/classes',
    useAuth,
    isOrganizerOrMore,
    isSameOrganizer,
    isShowExists,
    classesRoutes,
);

router.use('/shows/:showId/bundles', useAuth, bundlesRoutes);

router.use('/auth', authRoutes);

// TODO Refactor results route syntax
router.use('/results', resultsRoutes);
router.use('/contact', contactsRoutes);

router.use(
    '/shows/:showId/results',
    useAuth, isSecretaryOrMore, isShowExists, resultsRoutes);

router.use('/stripe', stripeRoutes);
router.use('/inscriptions/:id/pay',
    useAuth,
    isUserIncriptionExists,
    payInscription);


router.use('/', (req, res) => {
  res.status(404).json({
    message:
      'Specified route not found ' +
      'or method at specified route not allowed.',
  });
});


module.exports = router;
