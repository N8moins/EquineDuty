const express = require('express');
const {validate} = require('express-validation');
const rateLimit = require('express-rate-limit');
const router = express.Router({mergeParams: true});
const {isEmailAlreadyTaken} =
require('../middlewares/isUserExist.validation.js');

const {
  login,
  register,
  logout,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  isEmailExist,
  isVerifyTokenExists,
  resetPassword,
} = require('../controllers/auth.controller.js');

const {
  validateLogin,
  validateRegister,
  isLoginMatch,
  validateForgotPassword,
} = require('../middlewares/validations/auth.validation.js');

const {
  validationPasswordReset,
} = require('../middlewares/validations/users.validation.js');

const limiterLogin = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 10 requests
  message: 'Too many requests from this IP, please try again after 1 minute',
});

const limiterRegister = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 3 requests
  message: 'Too many requests from this IP, please try again after 1 minute',
});

router.post('/login',
    limiterLogin,
    validate(validateLogin, {}, {}),
    isLoginMatch('USER'),
    login);

router.post('/admin-login',
    limiterLogin,
    validate(validateLogin, {}, {}),
    isLoginMatch('ADMIN'),
    login);

router.post('/register',
    limiterRegister,
    validate(validateRegister, {}, {}),
    isEmailAlreadyTaken,
    register);

router.post('/forgot-password',
    validate(validateForgotPassword, {}, {}),
    isEmailExist,
    isVerifyTokenExists,
    forgotPassword);

router.post('/reset-password',
    validate(validationPasswordReset, {}, {}),
    resetPassword);

router.get('/logout', logout);
router.get('/access_token', refreshAccessToken);
router.get('/verify_email/:id', verifyEmail);

module.exports = router;
