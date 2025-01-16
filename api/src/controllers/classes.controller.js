const {
  addClasses,
  modifyClassById,
  deleteClassById,
  getClassesByShowId,
  getClassByIdAndShow,
  getJudgesByClassId,
  getClassesByDates,
} = require('../services/classes.service');

/**
 * POST /Classes
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} classes
 */
async function postClass(req, res) {
  try {
    const show_id = parseInt(req.params.showId);
    const newClass = await addClasses(req.body, show_id);

    return res.status(201).json(newClass);
  } catch (error) {
    return res
        .status(400)
        .json({message: error.message, error: 'Bad Request'});
  }
}

/**
 * GET judge by class id
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} classes
 */
async function getJudges(req, res) {
  try {
    const class_id = parseInt(req.params.classId);
    const judges = await getJudgesByClassId(class_id);
    if (Object.keys(judges).length < 1) {
      return res.status(204).json();
    }
    return res.status(200).json(judges);
  } catch (error) {
    return res
        .status(400)
        .json({message: error.message, error: 'Bad Request'});
  }
}

/**
 * GET /Classes
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} classes
 */
async function getClasses(req, res) {
  try {
    const show_id = parseInt(req.params.showId);
    const classes = await getClassesByShowId(show_id);
    return res.status(200).json(classes);
  } catch (error) {
    return res
        .status(400)
        .json({message: error.message, error: 'Bad Request'});
  }
}

/**
 * PUT /Classes
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} classes
 */
async function putClass(req, res) {
  try {
    const class_id = parseInt(req.params.classId);
    const result = await modifyClassById(req.body, class_id);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * DELETE class
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} class
 */
async function deleteClass(req, res) {
  try {
    const class_id = parseInt(req.params.classId);
    const result = await deleteClassById(class_id);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Get class by its id
 * @author API ALCHEMISTS
 *
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} class
 */
async function getById(req, res) {
  try {
    const class_id = parseInt(req.params.classId);
    const show_id = parseInt(req.params.showId);

    const result = await getClassByIdAndShow(class_id, show_id);

    if (!result) {
      return res.status(404).json({error: 'Class id not found'});
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Get All Classes by date
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} classes
 */
async function getShowAdminClassesByDate(req, res) {
  try {
    const show_id = parseInt(req.params.showId);
    const date = req.params.Date;
    const result = await getClassesByDates(show_id, date);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

module.exports = {
  postClass,
  putClass,
  deleteClass,
  getById,
  getClasses,
  getJudges,
  getShowAdminClassesByDate,
};
