const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY;

/**
 * JWT for user id 1 and role USER
 * @return {Promise<*>} return jwt
 */
async function jwtUser1() {
  const user = {
    id: 1,
    role: 'USER',
    is_verified: true,
  };

  return jwt.sign({user}, secretKey, {expiresIn: '5m'});
}

/**
 * JWT for user id 1 and role SECRETARY
 * @return {Promise<*>} return jwt
 */
async function jwtSecretary1() {
  const user = {
    id: 1,
    role: 'SECRETARY',
    is_verified: true,
  };

  return jwt.sign({user}, secretKey, {expiresIn: '5m'});
}

/**
 * JWT for user id 1 and role ORGANIZER
 * @return {Promise<*>} return jwt
 */
async function jwtOrganizer1() {
  const user = {
    id: 1,
    role: 'ORGANIZER',
    is_verified: true,
    stripe_connnected: true,
    remaining_shows: 100,
  };

  return jwt.sign({user}, secretKey, {expiresIn: '5m'});
}

/**
 * JWT for user id 1 and role ADMIN
 * @return {Promise<*>} return jwt
 */
async function jwtAdmin1() {
  const user = {
    id: 1,
    role: 'ADMIN',
    is_verified: true,
    stripe_connected: true,
  };

  return jwt.sign({user}, secretKey, {expiresIn: '5m'});
}

/**
 * JWT for user id 1 and role ORGANIZER and verif false
 * @return {Promise<*>} return jwt
 */
async function jwtOrganizerFalseVerif() {
  const user = {
    id: 2,
    role: 'ORGANIZER',
    is_verified: false,
  };

  return jwt.sign({user}, secretKey, {expiresIn: '5m'});
}

/**
 * JWT for user id 1 and role SECRETARY
 * @return {Promise<*>} return jwt
 */
async function jwtSecretaryFalseVerif() {
  const user = {
    id: 1,
    role: 'SECRETARY',
    is_verified: false,
  };

  return jwt.sign({user}, secretKey, {expiresIn: '5m'});
}

module.exports = {
  jwtUser1,
  jwtSecretary1,
  jwtOrganizer1,
  jwtAdmin1,
  jwtOrganizerFalseVerif,
  jwtSecretaryFalseVerif,
};
