const express = require('express');
const {validate} = require('express-validation');
const {
  putPassword,
  putUserNamePhoneAndBirth,
  putUser,
  getUser,
  getUsersList,
} = require('../controllers/users.controller');
const {
  validationPassword, validationUser, validationUserNameAnBirth,
} = require('../middlewares/validations/users.validation');
const {
  isSameUser,
  isAdmin,
  isSameUserOrAdmin,
} = require('../middlewares/validations/auth.validation');
const {isUserExist} = require('../middlewares/isUserExist.validation');

const router = express.Router({mergeParams: true});

router.get('/',
    isAdmin,
    getUsersList);

router.get('/:userId',
    isUserExist,
    isSameUserOrAdmin,
    getUser);

router.put('/:userId/password',
    isSameUser,
    validate(validationPassword, {}, {}),
    putPassword);

router.put('/:userId',
    isAdmin,
    validate(validationUser, {}, {}),
    putUser);

router.put('/:userId/profile',
    isSameUserOrAdmin,
    validate(validationUserNameAnBirth, {}, {}),
    putUserNamePhoneAndBirth);

module.exports = router;
