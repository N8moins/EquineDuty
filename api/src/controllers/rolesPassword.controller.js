const {
  getUserById,
  updateUserPassword,
} = require('../services/users.service');
const {UpdateUserVerif} = require('../services/resetPassword.service');
const bcrypt = require('bcryptjs');

/**
 * PUT /resetpassword replace the random password
 * with a new and update the user's verify
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} response
 */
async function putPasswordAndPutVerif(req, res) {
  try {
    const user = await getUserById(req.user.id);

    if (user.is_verified) {
      return res.status(403).json({error: 'The user is already verified'});
    }
    const isPasswordValid = await bcrypt.compare(
        req.body.old_password,
        user.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({error: 'Passwords do not match'});
    }

    const hashedPassword = await bcrypt.hash(req.body.new_password, 10);
    await updateUserPassword(req.user.id, hashedPassword);

    UpdateUserVerif(user.id);

    return res.status(200).json({message: 'Password updated'});
  } catch (error) {
    return res.status(500).json({error: 'Internal server error'});
  }
}

module.exports = {
  putPasswordAndPutVerif,
};
