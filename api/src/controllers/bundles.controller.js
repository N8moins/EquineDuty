const {addBundle, getBundlesByShowId} = require('../services/bundles.service');

/**
 * POST /bundle
 * @param {*} req Request
 * @param {*} res Response
 * @return {Promise<*>} bundle
 */
async function postBundle(req, res) {
  try {
    const show_id = parseInt(req.params.showId);
    const result = await addBundle(req.body, show_id);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * GET /bundles
 * @param {*} req Request
 * @param {*} res Response
 * @return {Promise<*>} bundle
 */
async function getBundles(req, res) {
  try {
    const show_id = parseInt(req.params.showId);
    const result = await getBundlesByShowId(show_id);
    if (Object.keys(result).length < 1) {
      return res.status(204).json({'message': 'Les ressource n\'existent pas'});
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

module.exports = {
  postBundle,
  getBundles,
};
