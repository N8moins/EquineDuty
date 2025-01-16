const {addAddress, getAddressesWithUserId} =
  require('../services/addresses.service');

/**
 * POST /address
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} address
 */
async function postAddress(req, res) {
  try {
    const user_id = parseInt(req.params.userId);
    const result = await addAddress(req.body, user_id);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Get addresses by user id
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} address
 */
async function getAddressesByUserId(req, res) {
  try {
    const user_id = parseInt(req.params.userId);

    const result = await getAddressesWithUserId(user_id);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

module.exports = {
  postAddress,
  getAddressesByUserId,
};
