const prisma = require('../../prisma/client');
const bcrypt = require('bcryptjs');

/**
 * Create a verification token for a user
 * @param {number} userId user id
 * @param {string} verificationToken token
 * @return {Promise<void>} void
 */
async function createVerifyToken(userId, verificationToken) {
  try {
    await prisma.verifyTokens.create({
      data: {
        token: verificationToken,
        user_id: userId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error('Error creating verification token:', error);
    throw error;
  }
}

/**
 * Verify the email of a user
 * @param {string} token token
 * @return {Promise<string>} message
 */
async function verifyEmails(token) {
  const transaction = await prisma.$transaction(async (prisma) => {
    try {
      const verifyTokenEntry = await prisma.verifyTokens.findUnique({
        where: {
          token: token,
        },
      });

      if (!verifyTokenEntry) {
        return null;
      }

      const user = await prisma.users.findUnique({
        where: {
          id: verifyTokenEntry.user_id,
        },
      });

      if (user.is_verified) {
        throw new Error('User already verified');
      }

      await prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          is_verified: true,
        },
      });

      await prisma.verifyTokens.delete({
        where: {
          id: verifyTokenEntry.id,
        },
      });

      return 'Email verified successfully';
    } catch (error) {
      throw error;
    }
  });

  return transaction;
}

/**
 * Reset password service
 * @param {string} token Token de réinitialisation du mot de passe
 * @param {string} newPassword Nouveau mot de passe
 * @return {Promise} Promise
 */
async function resetPasswordComfirmed(token, newPassword) {
  const transaction = await prisma.$transaction(async (prisma) => {
    try {
      const resetToken = await prisma.verifyTokens.findUnique({
        where: {
          token: token,
        },
      });

      if (!resetToken) {
        return null;
      }

      if (resetToken.expiration < new Date()) {
        return null;
      }


      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.users.update({
        where: {
          id: resetToken.user_id,
        },
        data: {
          password: hashedPassword,
        },
      });

      await prisma.verifyTokens.delete({
        where: {
          id: resetToken.id,
        },
      });

      return {message: 'Password reset successfully'};
    } catch (error) {
      throw new Error('Failed to reset password: ' + error.message);
    }
  });
  return transaction;
}


module.exports = {
  createVerifyToken,
  verifyEmails,
  resetPasswordComfirmed,
};
