const {
  addSecretary,
  removeSecretaryInShow,
} = require('../services/secretaries.service');
const {showByIdAllData} = require('../services/shows.service.js');
/**
 * POST secretaties
 *
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} result
 */
async function postSecretary(req, res) {
  try {
    const show_id = parseInt(req.params.showId);
    const response = await addSecretary(req.body, show_id);

    const returnCodeWithResponseMap = {
      'User is an organizer or admin': 400,
      'User updated': 200,
      'User created': 201,
    };

    return res
        .status(
            returnCodeWithResponseMap[response] ?
              returnCodeWithResponseMap[response] :
              500,
        )
        .json(response);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Removes secretary role
 *
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} result
 */
async function removeSecretaryRole(req, res) {
  try {
    const showId = parseInt(req.params.showId);
    const show = await showByIdAllData(showId);
    await removeSecretaryInShow(showId, show.organizer_id);
    return res.status(200).json('Secretary removed from show successfully');
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

module.exports = {
  postSecretary,
  removeSecretaryRole,
};
