const prisma = require('../../prisma/client.js');

/**
 * Check if user exist in bd
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} return error or next
 */
async function isUserExist(req, res, next) {
  try {
    const user_id = parseInt(req.params.userId);

    const result = await prisma.users.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!result) {
      return res.status(404).json({error: 'User id not found'});
    }

    return next();
  } catch (error) {
    return res.status(404).json({error: 'User id not found'});
  }
}

/**
 * Check if user exist in bd
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} return error or next
 */
async function isEmailAlreadyTaken(req, res, next) {
  try {
    const result = await prisma.users.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (result) {
      return res.status(400).json({error: 'Email already taken'});
    }

    return next();
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}


module.exports = {
  isUserExist,
  isEmailAlreadyTaken,
};
