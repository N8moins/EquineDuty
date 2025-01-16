const {addOrganizers} =
  require('../services/organizers.service');

/**
 * POST organizers
 *
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} result
 */
async function postOrganizers(req, res) {
  try {
    const response = await addOrganizers(req.body);
    return res.status(response === 'User updated' ? 200 : 201 ).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
}

module.exports = {
  postOrganizers,
};
