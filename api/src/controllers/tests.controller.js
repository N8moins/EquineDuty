const {
  addTests,
  linkTest,
  getTestsByUserId,
  getTestByIdWithMarks,
  deleteTestById,
  modifyTestById,
} = require('../services/tests.service.js');

const {getClassWithTestId} =
  require('../services/classes.service');
const {showById} = require('../services/shows.service.js');

/**
 * POST /Tests
 * @param {*} req request
 * @param {*} res response
 *
 * @return {Promise<*>} tests
 */
async function postTests(req, res) {
  try {
    const user_id = parseInt(req.params.userId);
    const newTest = await addTests(req.body, user_id);

    return res.status(201).json(newTest);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * PUT /Tests
 * @param {*} req request
 * @param {*} res response
 *
 * @return {Promise<*>} tests
 */
async function putTest(req, res) {
  try {
    const test_id = parseInt(req.params.testId);
    const classe = await getClassWithTestId(test_id);

    if (classe !== null && classe !== undefined) {
      const show = await showById(classe.show_id);
      if (show.is_published) {
        return res.status(403).json({error: 'The show is already published'});
      }
    }
    const newTest = await modifyTestById(req.body, test_id);

    return res.status(200).json(newTest);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * PUT /test/:testId/class/:classId
 *
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} Linked Tests
 */
async function linkTestToClass(req, res) {
  try {
    const test_id = parseInt(req.params.testId);
    const class_id = parseInt(req.params.classId);

    const result = await linkTest(test_id, class_id);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Get all the tests from the user id
 * @param {*} req
 * @param {*} res
 *
 * @return {Promise<*>} tests
 */
async function getTestsFromUserId(req, res) {
  try {
    const user_id = parseInt(req.params.userId);

    const tests = await getTestsByUserId(user_id);
    return res.status(200).json(tests);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}
/**
 * Get a test by is id.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @return {Promise<*>} The resquested test.
 */
async function getTest(req, res) {
  try {
    const test_id = parseInt(req.params.testId);

    const test = await getTestByIdWithMarks(test_id);

    return res.status(200).json(test);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Delete test by his id
 * @param {*} req
 * @param {*} res
 *
 * @return {Promise<*>} test
 */
async function deleteTest(req, res) {
  try {
    const test_id = parseInt(req.params.testId);
    const test = await deleteTestById(test_id);
    return res.status(200).json(test);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

module.exports = {
  postTests,
  linkTestToClass,
  getTestsFromUserId,
  getTest,
  deleteTest,
  putTest,
};
