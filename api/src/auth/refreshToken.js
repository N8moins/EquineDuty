const prisma = require('../../prisma/client');
const crypto = require('crypto');

/**
 * Generate refresh token
 * @param {*} res response
 * @param {int} user_id user_id
 * @return {*} return token or error
 */
async function generateRefreshToken(res, user_id) {
  try {
    const refreshToken = crypto.randomBytes(32).toString('hex');

    const refreshTokenExists = await prisma.refreshTokens.findUnique({
      where: {
        user_id: user_id,
      },
    });

    let newRefreshToken = null;

    if (!refreshTokenExists ||
      refreshTokenExists === null ||
      refreshTokenExists === undefined) {
      newRefreshToken = await prisma.refreshTokens.create({
        data: {
          user_id: user_id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
      });
    } else {
      newRefreshToken = await prisma.refreshTokens.update({
        where: {
          user_id: user_id,
        },
        data: {
          token: refreshToken,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
      });
    }

    if (newRefreshToken &&
      newRefreshToken !== null &&
      newRefreshToken !== undefined) {
      return newRefreshToken.token;
    }

    return res.status(500).send('Internal Server Error');
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
}

/**
 * Delete refresh token
 * @param {*} refreshToken refreshToken
 * @return {*} return true or null
 */
async function deleteRefreshToken(refreshToken) {
  try {
    const result = await prisma.refreshTokens.delete({
      where: {
        token: refreshToken,
      },
    });

    if (!result || result === null || result === undefined) {
      return null;
    }

    return true;
  } catch (error) {
    return error;
  }
}

module.exports = {
  generateRefreshToken,
  deleteRefreshToken,
};
