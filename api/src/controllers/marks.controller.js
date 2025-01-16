const {addMarks}= require('../services/marks.service.js');
const {getTestById}= require('../services/tests.service.js');
// eslint-disable-next-line no-unused-vars
const {Container} = require('winston');

/**
 * POST /Marks
 * @param {*} req request
 * @param {*} res response
 *
 * @return {Promise<*>} marks
 */
async function postMarks(req, res) {
  try {
    const testId = req.params.testId;
    const test = await getTestById(parseInt(testId));

    if (test === null) {
      return res.status(404).json({message: 'Test id not found.'});
    }
    const newMark = await addMarks(req.body, testId, test);

    if (newMark === 'standard') {
      return res.status(401).json({message:
        'Count of mark_standard is full'});
    }
    if (newMark === 'collective') {
      return res.status(401).json({message:
        'Count of mark_collective is full'});
    }

    return res.status(201).json(newMark);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
};

module.exports = {
  postMarks,
};
