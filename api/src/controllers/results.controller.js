const {addResult,
  modifyResultByRiderTestId,
  getResultsByRiderTestId,
  getResultByShow,
  getResultByJudgRidereId,
  deleteResultByJudgeRiderId} =
  require('../services/results.service');

/**
 * GET results/shows/:showId
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @return {Promise<*>} List of the show results.
 */
async function getResults(req, res) {
  try {
    const showId = parseInt(req.params.showId);

    const response = await getResultByShow(showId);

    return res.status(200).json({show: response});
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * POST results/tests/:testId/riders/:riderId
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} result
 */
async function postResults(req, res) {
  try {
    const testId = parseInt(req.params.testId);
    const riderId = parseInt(req.params.riderId);
    const judgeId = parseInt(req.params.judgeId);
    const response = await addResult(req.body, testId, riderId, judgeId);
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Delete result
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} result
 */
async function deleteResultByJudgeAndRider(req, res) {
  try {
    const riderId = parseInt(req.params.riderId);
    const judgeId = parseInt(req.params.judgeId);
    const response = await deleteResultByJudgeRiderId(judgeId, riderId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
}

/**
 * Get result
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} result
 */
async function getResultByJudgeAndRider(req, res) {
  try {
    const riderId = parseInt(req.params.riderId);
    const judgeId = parseInt(req.params.judgeId);
    const response = await getResultByJudgRidereId(judgeId, riderId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * PUT results/tests/:testId/riders/:riderId
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} result
 */
async function putResults(req, res) {
  try {
    const testId = parseInt(req.params.testId);
    const riderId = parseInt(req.params.riderId);

    const results = await getResultsByRiderTestId(testId, riderId);

    const response = await modifyResultByRiderTestId(req.body, results.id);

    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

module.exports = {
  getResults,
  postResults,
  putResults,
  getResultByJudgeAndRider,
  deleteResultByJudgeAndRider,
};
