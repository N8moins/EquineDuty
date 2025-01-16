const {
  addRider,
  modifyRiderById,
  getRiderById,
  getRidersOfUser,
  deleteRiderById,
  getRidersByClassId,
} = require('../services/riders.service.js');

/**
 * POST /riders
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} rider
 */
async function postRider(req, res) {
  try {
    const user_id = parseInt(req.params.userId);
    const result = await addRider(req.body, user_id);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
};

/**
 * PUT /riders
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} rider
 */
async function putRider(req, res) {
  try {
    const rider_id = parseInt(req.params.riderId);
    const user_id = parseInt(req.params.userId);
    const result = await modifyRiderById(req.body, user_id, rider_id);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * GET /rider/id
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} rider
 */
async function getRider(req, res) {
  try {
    const rider_id = parseInt(req.params.riderId);
    const result = await getRiderById(rider_id);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * GET /riders
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} riders
 */
async function getRiders(req, res) {
  try {
    const user_id = parseInt(req.params.userId);
    const result = await getRidersOfUser(user_id);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * GET riders by class
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} classes
 */
async function getRidersClass(req, res) {
  try {
    const class_id = parseInt(req.params.classId);
    const riders = await getRidersByClassId(class_id);

    if (riders.length < 1) {
      return res.status(204).json();
    }
    return res.status(200).json({riders: riders});
  } catch (error) {
    return res.status(400).json({message: error.message, error: 'Bad Request'});
  }
}


/**
 * DELETE /riders/id
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} riders
 */
async function deleteRider(req, res) {
  try {
    const rider_id = parseInt(req.params.riderId);
    const user_id = parseInt(req.params.userId);
    const result = await deleteRiderById(user_id, rider_id);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}


module.exports = {
  postRider,
  putRider,
  getRider,
  getRiders,
  deleteRider,
  getRidersClass,
};
