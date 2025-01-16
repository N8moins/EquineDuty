const {Joi} = require('express-validation');
const prisma = require('../../../prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dictRole = {
  USER: 1,
  SECRETARY: 100,
  ORGANIZER: 200,
  ADMIN: 300,
};

/**
 * Role values
 * @param {string} roleString role as a string
 * @return {number} number
 * @author Maxime Labrecque
 */
const roleValues = (roleString) => dictRole[roleString];

/**
 * Validate JWT and set user
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function useAuth(req, res, next) {
  try {
    const accessToken = req.headers.authorization;
    if (!accessToken || !accessToken.match(/^[\w-]+\.[\w-]+\.[\w-]+$/)) {
      return res.status(401).send('Unauthorized');
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    if (!decoded || decoded === null || decoded === undefined) {
      return res.status(401).send('Unauthorized');
    }

    req.user = decoded.user;

    // Check if user is active/banned/disabled
    if (req.user.is_active === false) {
      return res.status(401).send('Unauthorized');
    }

    // check if user is verified
    if (req.user.is_verified === false) {
      return res.status(401).send('Unauthorized');
    }

    return next();
  } catch (error) {
    return res.status(401).send('Unauthorized');
  }
}

/**
 * Validate JWT and set user for not verified users
 * IS CALLED ONLY FOR ADMIN/OGANIZER/SECRETARY TO MODIFY INITIAL PASSWORD
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function useAuthNotVerified(req, res, next) {
  try {
    const accessToken = req.headers.authorization;
    if (!accessToken || !accessToken.match(/^[\w-]+\.[\w-]+\.[\w-]+$/)) {
      return res.status(401).send('Unauthorized');
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    if (!decoded || decoded === null || decoded === undefined) {
      return res.status(401).send('Unauthorized');
    }

    req.user = decoded.user;

    // Check if user is active/banned/disabled
    if (req.user.is_active === false) {
      return res.status(401).send('Unauthorized');
    }

    // check if user is verified, cannot call if verified
    if (req.user.is_verified === true) {
      return res.status(401).send('Cannot call this route if verified.');
    }

    return next();
  } catch (error) {
    return res.status(401).send('Unauthorized');
  }
}

/**
 * Check if user is the same as the request
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isSameOrganizerOrAdmin(req, res, next) {
  if (req.user.role === 'ADMIN') {
    return next();
  }
  const show = await prisma.shows.findUnique({
    where: {
      id: parseInt(req.params.showId),
    },
  });
  if (show.organizer_id === req.user.id) {
    return next();
  }
  return res.status(403).send('Forbidden');
}

/**
 * Check if user is the same as the request
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isSameUser(req, res, next) {
  if (req.user.id === parseInt(req.params.userId)) {
    return next();
  }
  return res.status(403).send('Forbidden');
}

/**
 * Check if user is the same as the request or admin
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isSameUserOrAdmin(req, res, next) {
  if (
    req.user.id === parseInt(req.params.userId) ||
    req.user.role === 'ADMIN'
  ) {
    return next();
  }

  return res.status(403).send('Forbidden');
}

/**
 * Check if user is more than a user
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isSecretaryOrMore(req, res, next) {
  if (roleValues(req.user.role) >= roleValues('SECRETARY')) {
    return next();
  }
  return res.status(403).send('Forbidden');
}

/**
 * Check if user is more than a secretary
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isOrganizerOrMore(req, res, next) {
  if (roleValues(req.user.role) >= roleValues('ORGANIZER')) {
    return next();
  }
  return res.status(403).send('Forbidden');
}

/**
 * Check if user is organizer
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isOrganizer(req, res, next) {
  if (req.user.role === 'ORGANIZER') {
    return next();
  }
  return res.status(403).send('Forbidden');
}

/**
 * Check if user is more than a secretary
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
async function isAdmin(req, res, next) {
  if (roleValues(req.user.role) >= roleValues('ADMIN')) {
    return next();
  }
  return res.status(403).send('Forbidden');
}

/**
 * Check if login match
 * @param {string} roleAllowed role allowed ('USER', 'ADMIN').
 *  'ADMIN' allows secretary, organizer and admin to login.
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {Promise<*>} return error or next
 */
function isLoginMatch(roleAllowed) {
  return async function(req, res, next) {
    try {
      const email = req.body.email;
      const password = req.body.password;

      const userExists = await prisma.users.findUnique({
        where: {
          email: email,
        },
      });

      // check if user exists
      if (!userExists || userExists === null || userExists === undefined) {
        return res
            .status(401)
            .json({message: 'Email or password is invalid'});
      }

      // check if password matches
      const passwordMatch = await bcrypt.compare(password, userExists.password);
      if (!passwordMatch) {
        return res
            .status(401)
            .json({message: 'Email or password is invalid'});
      }

      // check if role is user has role user to login on client website
      if (roleAllowed === 'USER' && userExists.role !== 'USER') {
        return res
            .status(401)
            .json({message: 'Email or password is invalid'});
      }

      // check if user is verified on client website
      // ADMIN/ORGANIZER/SECRETARY can login without verification ->
      //    to be able to call reset password route with temporary password.
      if (roleAllowed === 'USER' && userExists.is_verified === false) {
        return res
            .status(401)
            .json({message: 'Verify you email inbox to verify your account.'});
      }

      // check if user role is admin to login on admin website
      if (roleAllowed === 'ADMIN' &&
        roleValues(userExists.role) <= roleValues('USER')
      ) {
        return res
            .status(401)
            .json({message: 'Email or password is invalid'});
      }

      // check if user is active
      if (userExists.is_active === false) {
        return res
            .status(401)
            .json({message: 'Email or password is invalid'});
      }

      req.user = {
        id: userExists.id,
        role: userExists.role,
        name: userExists.name,
        is_verified: userExists.is_verified,
      };

      if (userExists.role === 'ORGANIZER') {
        // add remaining shows to JWT payload
        const organizerInfo = await prisma.organizerShows.findUnique({
          where: {
            user_id: userExists.id,
          },
          select: {
            remaining_shows: true,
          },
        });
        if (organizerInfo) {
          req.user.remaining_shows = organizerInfo.remaining_shows;
        } else {
          req.user.remaining_shows = 0;
        }

        // add stripe_connected to JWT payload
        const stripeConnected = await prisma.stripeAccountUsers.findUnique({
          where: {
            user_id: userExists.id,
          },
        });
        if (stripeConnected) {
          req.user.stripe_connected = true;
        } else {
          req.user.stripe_connected = false;
        }
      }

      return next();
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  };
}

const validateRegister = {
  body: Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string()
        .min(8)
        .regex(
            // eslint-disable-next-line max-len
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]{8,}$/,
        )
        .required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    birthdate: Joi.date().optional().allow(null),
  }),
};

const validateLogin = {
  body: Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string().required(),
  }),
};
const validateForgotPassword = {
  body: Joi.object({
    email: Joi.string().email().required().max(255),
  }),
};
module.exports = {
  useAuth,
  useAuthNotVerified,
  isSameUser,
  isAdmin,
  isOrganizerOrMore,
  isOrganizer,
  isSecretaryOrMore,
  isLoginMatch,
  isSameOrganizerOrAdmin,
  validateLogin,
  validateRegister,
  isSameUserOrAdmin,
  validateForgotPassword,
};
