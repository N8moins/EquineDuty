const prisma = require('../../prisma/client');
const bcrypt = require('bcryptjs');
const {v4: uuidv4} = require('uuid');
const {sendVerificationEmail} = require('../emails/emailRegister.js');
const {sendForgotPassword} = require('../emails/emailForgotPW.js');
const {
  generateRefreshToken,
  deleteRefreshToken,
} = require('../auth/refreshToken.js');
const jwt = require('jsonwebtoken');
const {createVerifyToken, verifyEmails, resetPasswordComfirmed} =
 require('../services/auth.service');

const secretKey = process.env.JWT_SECRET_KEY;

/**
 * Login
 * @param {*} req request
 * @param {*} res response
 * @return {*} return token or error
 */
async function login(req, res) {
  try {
    const user = req.user;

    const accessToken = jwt.sign({user}, secretKey, {expiresIn: '14d'});
    const refreshToken = await generateRefreshToken(res, user.id);

    let cookieName = 'refresh_token';
    if (process.env.NODE_ENV === 'production' && user.role !== 'USER') {
      cookieName = 'organizer_refresh_token';
    }

    return res
        .status(200)
        .cookie(cookieName, refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/api/auth/',
          maxAge: 60 * 60 * 24 * 14,
        })
        .json({access_token: accessToken});
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
}

/**
 * Register
 * @param {*} req request
 * @param {*} res response
 * @return {*} return user created or error
 */
async function register(req, res) {
  try {
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = uuidv4();

    const result = await prisma.users.create({
      data: {
        email: req.body.email,
        password: hashedPassword,
        name: req.body.name,
        phone: req.body.phone,
      },
    });

    if (req.body.birthdate) {
      result.birthdate = new Date(req.body.birthdate);
    }

    await createVerifyToken(result.id, verificationToken);

    if (result) {
      await sendVerificationEmail(req.body.email, verificationToken);
      return res.status(201).send('User created');
    }

    return res.status(500).send('Internal Server Error');
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
}

/**
 * Logout
 * @param {*} req request
 * @param {*} res response
 * @return {*} return logged out or error
 */
async function logout(req, res) {
  try {
    let refreshToken = req.cookies['refresh_token'];
    if (process.env.NODE_ENV === 'production' &&
      req.headers.origin === process.env.ORGANIZER_URL) {
      refreshToken = req.cookies['organizer_refresh_token'];
    }

    if (!refreshToken || refreshToken === null || refreshToken === undefined) {
      return res.status(401).send('Access Denied. No token provided.');
    }

    if (process.env.NODE_ENV === 'production' &&
      req.headers.origin === process.env.ORGANIZER_URL) {
      res.clearCookie('organizer_refresh_token');
    } else {
      res.clearCookie('refresh_token');
    }

    if (deleteRefreshToken(refreshToken)) {
      return res.status(200).send('Logged out');
    }

    return res.status(500).send('Internal Server Error');
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
}

/**
 * Refresh access token
 * @param {*} req request
 * @param {*} res response
 * @return {*} return new token or error
 */
async function refreshAccessToken(req, res) {
  try {
    let refreshToken = req.cookies['refresh_token'];

    if (process.env.NODE_ENV === 'production' &&
      req.headers.origin === process.env.ORGANIZER_URL) {
      refreshToken = req.cookies['organizer_refresh_token'];
    }

    if (!refreshToken || refreshToken === null || refreshToken === undefined) {
      return res.status(401).send('Access Denied. No token provided.');
    }

    const refreshTokenExists = await prisma.refreshTokens.findUnique({
      where: {
        token: refreshToken,
      },
      include: {
        user: true,
      },
    });

    if (refreshTokenExists === null) {
      return res.status(400).send('Invalid token.');
    }

    if (refreshTokenExists.expiration < new Date()) {
      return res.status(400).send('Token has expired. Please log in again.');
    }

    if (process.env.NODE_ENV === 'production') {
      if (req.headers.origin === process.env.CLIENT_URL) {
        if (refreshTokenExists.user.role !== 'USER') {
          return res.status(401).send('Access Denied. Wrong token provided.');
        }
      } else {
        if (refreshTokenExists.user.role === 'USER') {
          return res.status(401).send('Access Denied. Wrong token provided.');
        }
      }
    }

    const _user = await prisma.users.findUnique({
      where: {
        id: refreshTokenExists.user_id,
      },
    });

    const user = {
      id: _user.id,
      role: _user.role,
      name: _user.name,
      is_verified: _user.is_verified,
    };

    if (_user.role === 'ORGANIZER') {
      // add remaining shows to JWT payload
      const organizerInfo = await prisma.organizerShows.findUnique({
        where: {
          user_id: _user.id,
        },
        select: {
          remaining_shows: true,
        },
      });
      if (organizerInfo) {
        user.remaining_shows = organizerInfo.remaining_shows;
      } else {
        user.remaining_shows = 0;
      }

      // add stripe_connected to JWT payload
      const stripeConnected = await prisma.stripeAccountUsers.findUnique({
        where: {
          user_id: _user.id,
        },
      });
      if (stripeConnected) {
        user.stripe_connected = true;
      } else {
        user.stripe_connected = false;
      }
    }

    const newAccessToken = jwt.sign({user}, secretKey, {expiresIn: '14d'});
    const newRefreshToken = await generateRefreshToken(res, user.id);

    let cookieName = 'refresh_token';
    if (process.env.NODE_ENV === 'production' && user.role !== 'USER') {
      cookieName = 'organizer_refresh_token';
    }

    return res
        .status(200)
        .cookie(cookieName, newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/api/auth/',
          maxAge: 60 * 60 * 24 * 14,
        })
        .json({access_token: newAccessToken});
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
}

/**
 * Verify email
 * @param {*} req request
 * @param {*} res response
 * @return {*} return email verified or error
 */
async function verifyEmail(req, res) {
  try {
    const token = req.params.id;

    const result = await verifyEmails(token);

    if (result == null) {
      return res.status(401).json({message: 'Invalid token'});
    }

    return res.status(201).send(result);
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
}

/**
 * Check if email exist
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {*} return error or next
 */
async function isEmailExist(req, res, next) {
  try {
    const email = req.body.email;

    const result = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!result) {
      return res.status(400).json({error: 'User not found'});
    }
    req.user = result;
    return next();
  } catch (error) {
    return res.status(500).json({error: 'Internal Server Error'});
  }
}

/**
 * Check if verify token exists
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @return {*} return error or next
 */
async function isVerifyTokenExists(req, res, next) {
  try {
    const result = await prisma.verifyTokens.findUnique({
      where: {
        user_id: req.user.id,
      },
    });

    if (result) {
      if (result.expiresAt < new Date()) {
        await prisma.verifyTokens.delete({
          where: {
            user_id: req.user.id,
          },
        });
        return next();
      } else {
        return res.status(400).json({error: 'Verify token already sent'});
      }
    }
    return next();
  } catch (error) {
    return res.status(500).json({error: 'Internal Server Error'});
  }
}


/**
 * Forgot password
 * @param {*} req request
 * @param {*} res response
 * @return {*} return reset token created or error
 */
async function forgotPassword(req, res) {
  try {
    const email = req.body.email;

    const resetToken = uuidv4();

    await createVerifyToken(req.user.id, resetToken);

    await sendForgotPassword(email, resetToken);

    return res.status(200).json({message: 'Email sent with reset link'});
  } catch (error) {
    return res.status(500).json({message: 'Internal Server Error'});
  }
}

/**
 * Route pour réinitialiser le mot de passe
 * @param {*} req Requête
 * @param {*} res Réponse
 * @return {*} Résultat
 */
async function resetPassword(req, res) {
  try {
    const token = req.body.token;
    const new_password = req.body.password;

    const result = await resetPasswordComfirmed(token, new_password);
    if (result == null) {
      return res.status(401).json({message: 'Invalid token'});
    }
    return res.status(201).json({message: result});
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to reset password: ' + error.message});
  }
}

module.exports = {
  login,
  register,
  logout,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  isEmailExist,
  isVerifyTokenExists,
};
