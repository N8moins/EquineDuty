const bcrypt = require('bcryptjs');
const {
  getUserById,
  getUsersListByFilters,
  updateUserPassword,
  updateUser,
} = require('../services/users.service');
const {showByUserId,
  removeSecretaryFromShow} = require('../services/shows.service');

/**
 * PUT /users/id/password
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} response
 */
async function putPassword(req, res) {
  try {
    const user = await getUserById(req.user.id);
    const isPasswordValid = await bcrypt.compare(
        req.body.old_password,
        user.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({error: 'Passwords do not match'});
    }

    if (req.body.new_password === req.body.old_password) {
      return res.status(400).json({error:
        'Your new password must be different'});
    }

    const hashedPassword = await bcrypt.hash(req.body.new_password, 10);
    await updateUserPassword(req.user.id, hashedPassword);

    return res.status(200).json({message: 'Password updated'});
  } catch (error) {
    return res.status(500).json({error: 'Internal server error'});
  }
}

/**
 * PUT /users/id for admin
 * admin route
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} response
 */
async function putUser(req, res) {
  try {
    const user_id = parseInt(req.params.userId);
    if (req.body.birthdate ) {
      req.body.birthdate = new Date(req.body.birthdate);
    }

    if (req.body.remaining_shows !== undefined &&
      req.body.remaining_shows !== null &&
      req.body.role !== 'ORGANIZER') {
      return res.status(400).json({
        message: 'Remaining shows is only for organizers',
      });
    }

    const user = await getUserById(user_id);

    if (user.role === 'SECRETARY' && req.body.role === 'USER') {
      // remove user from all events
      const showsWithSecretary = await showByUserId(user_id);
      for (const show of showsWithSecretary) {
        await removeSecretaryFromShow(show.id, show.organizer_id);
      }
    }


    const updatedUser = await updateUser(user_id, req.body);
    updatedUser.password = undefined;

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({error: 'Internal server error'});
  }
}

/**
 * PUT /users/id just name, phone and birthdate
 * admin route
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} response
 */
async function putUserNamePhoneAndBirth(req, res) {
  try {
    const user_id = parseInt(req.params.userId);
    req.body.birthdate = new Date(req.body.birthdate);

    const updatedUser = await updateUser(user_id, req.body);
    const _updatedUser = {
      name: updatedUser.name,
      phone: updatedUser.phone,
      birthdate: updatedUser.birthdate,
    };
    return res.status(200).json(_updatedUser);
  } catch (error) {
    return res.status(500).json({error: 'Internal server error'});
  }
}
/**
 * GET /users/id
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} user or error
 */
async function getUser(req, res) {
  try {
    const user_id = parseInt(req.params.userId);
    const _user = await getUserById(user_id);

    _user.password = undefined;

    if (req.user.role === 'USER') {
      _user.role = undefined;
      _user.is_verified = undefined;
      _user.created_at = undefined;
      _user.updated_at = undefined;
    }

    return res.status(200).json(_user);
  } catch (error) {
    return res.status(500).json({error: 'Internal server error'});
  }
}

/**
 * Function to get a list of users by filter.
 * GET /users
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @return {Promise<*>} .
 */
async function getUsersList(req, res) {
  try {
    const filters = getFilters(req);
    const usersList = await getUsersListByFilters(req, filters);
    return res.status(200).json(usersList);
  } catch (error) {
    return res.status(500).json({error: 'Internal server error'});
  }
}

/**
 * Function that return an array of filters used to filter the users.
 * @param {*} req HTTP request.
 * @return {Array} Array of filters
 */
function getFilters(req) {
  const filters = [];
  if (req.query.name !== undefined) {
    const names =
      Array.isArray(req.query.name) ? req.query.name : [req.query.name];
    names.forEach((name) => filters.push({filter: 'name', value: name}));
  }
  if (req.query.email !== undefined) {
    const emails =
      Array.isArray(req.query.email) ? req.query.email : [req.query.email];
    emails.forEach((email) => filters.push({filter: 'email', value: email}));
  }
  if (req.query.role !== undefined) {
    const roles =
      Array.isArray(req.query.role) ? req.query.role : [req.query.role];
    roles.forEach((role) => filters.push({filter: 'role', value: role}));
  }
  return filters;
}

module.exports = {
  putPassword,
  putUser,
  getUser,
  getUsersList,
  putUserNamePhoneAndBirth,
};
