const prisma = require('../../prisma/client');
const {getHorseById} = require('./horses.service');
const {getRiderById} = require('./riders.service');

/**
 * Add a result to the database
 * @param {*} data
 * @param {int} testId
 * @param {int} riderId
 * @param {int} judgeId
 * @return {Promise<*>} new result
 */
async function addResult(data, testId, riderId, judgeId) {
  const {
    score,
    nbErrors,
    reason,
    horse_id,
    rider_entry_number,
  } = data;

  const _horse = await getHorseById(parseInt(horse_id));
  const _rider = await getRiderById(parseInt(riderId));

  const newResult = await prisma.results.create({
    data: {
      test_id: testId,
      rider_id: riderId,
      score: parseFloat(score),
      reason,
      nb_errors: parseInt(nbErrors),
      horse_id: parseInt(horse_id),
      judge_id: parseInt(judgeId),
      horse_name: _horse.name,
      rider_name: _rider.name,
      rider_entry_number: parseInt(rider_entry_number),
    },
  });

  const newResultFormat = {
    score: newResult.score,
    nbErrors: newResult.nb_errors,
    reason: newResult.reason,
    horse_id: newResult.horse_id,
    rider_entry_number: newResult.rider_entry_number,
  };

  return newResultFormat;
}

/**
 * Get result by judge id and rider id
 * @param {int} judge_id judge_id
 * @param {int} riderId riderId
 * @return {Promise<*>} results
 */
async function getResultByJudgRidereId(judge_id, riderId) {
  const results = await prisma.results.findFirst({
    where: {
      judge_id: judge_id,
      rider_id: riderId,
    },
  });

  return results;
}


/**
 * Get result by rider and test id
 * @param {int} testId
 * @param {int} riderId
 * @return {Promise<*>} results
 */
async function getResultsByRiderTestId(testId, riderId) {
  const results = await prisma.results.findFirst({
    where: {
      test_id: testId,
      rider_id: riderId,
    },
  });

  return results;
}

/**
 * Return the results of a show.
 * @param {int} showId The show id.
 * @return {Promise<*>} List of the show results.
 */
async function getResultByShow(showId) {
  let data;
  await prisma.$transaction(async (prisma) => {
    const show = await prisma.shows.findUnique({
      where: {
        id: showId,
      },
      select: {
        name: true,
        start_date: true,
      },
    });

    const classes = await prisma.classes.findMany({
      where: {
        show_id: showId,
      },
      select: {
        name: true,
        number: true,
        test: {
          select: {
            name: true,
            Results: {
              orderBy: {
                score: 'desc',
              },
              select: {
                rider_name: true,
                horse_name: true,
                score: true,
                rider_entry_number: true,
              },
            },
          },
        },
      },
    });

    show.classes = classes;

    const processShowResults = processData(show);

    data = processShowResults;
  });

  return data;
}

/**
 * Function to process the received data and combine the score to get
 * the average
 * @param {*} show The show JSON object
 * @return {*} The processed show JSON object
 */
function processData(show) {
  const processJson = {
    name: show.name,
    start_date: show.start_date,
  };
  let scoreTotal = 0;
  let nbScore = 0;

  processJson['classes'] = [];

  show.classes.forEach((classesInfo) => {
    const results = classesInfo.test.Results;

    const groupedResults = results.reduce((resultGroups, elem) => {
      const riderName = elem.rider_name;

      if (!resultGroups[riderName]) {
        resultGroups[riderName] = [];
      }

      resultGroups[riderName].push(elem);

      return resultGroups;
    }, {});

    const resultsArr = [];

    Object.entries(groupedResults).forEach((elem) => {
      let riderName = '';
      let horseName = '';
      let riderEntryNumber = '';

      elem[1].forEach((result) => {
        if (riderName === '' && horseName === '' && riderEntryNumber === '') {
          riderName = result.rider_name;
          horseName = result.horse_name;
          riderEntryNumber = result.rider_entry_number;
        }

        scoreTotal += result.score;
        nbScore++;
      });

      scoreTotal = scoreTotal / nbScore;

      results.sort((a, b) =>
        parseFloat(b.scoreTotal) - parseFloat(a.scoreTotal));

      resultsArr.push({
        'rider_name': riderName,
        'horse_name': horseName,
        'score': scoreTotal,
        'rider_entry_number': riderEntryNumber,
      });

      nbScore = 0;
      scoreTotal = 0;
    });

    processJson.classes.push({
      'name': classesInfo.name,
      'number': classesInfo.number,
      'test': {
        'name': classesInfo.test.name,
        'results': resultsArr,
      },
    });
  });

  return processJson;
}

/** Get result by rider and test id
 * @param {int} testId testId
 * @param {int} riderId riderId
 * @param {int} judgeId judgeId
 * @return {Promise<*>} results
 */
async function getResultsByRiderTestIdJudgeId(testId, riderId, judgeId) {
  const results = await prisma.results.findFirst({
    where: {
      test_id: testId,
      rider_id: riderId,
      judge_id: judgeId,
    },
  });

  return results;
}

/**
 *  Modify a result by rider and test ids
 * @param {*} data
 * @param {int} resultId
 * @return {Promise<*>} result
 */
async function modifyResultByRiderTestId(data, resultId) {
  const {score, nbErrors, reason, horse_id, rider_entry_number} = data;
  try {
    const newResult = await prisma.results.update({
      where: {
        id: resultId,
      },
      data: {
        score: parseFloat(score),
        nb_errors: parseInt(nbErrors),
        reason,
        horse_id: parseInt(horse_id),
        rider_entry_number: parseInt(rider_entry_number),
      },
    });

    const newResultFormat = {
      score: newResult.score,
      nbErrors: newResult.nb_errors,
      reason: newResult.reason,
      horse_id: newResult.horse_id,
      rider_entry_number: newResult.rider_entry_number,
    };

    return newResultFormat;
  } catch (error) {
  }
}

/**
 * Delete result by judge id and rider id
 * @param {int} judge_id judge_id
 * @param {int} riderId riderId
 * @return {Promise<*>} results
 */
async function deleteResultByJudgeRiderId(judge_id, riderId) {
  const result = await getResultsByRiderTestId(judge_id, riderId);
  const results = await prisma.results.delete({
    where: {
      id: result.id,
    },
  });

  return results;
}


module.exports = {
  addResult,
  getResultsByRiderTestId,
  getResultByShow,
  modifyResultByRiderTestId,
  getResultByJudgRidereId,
  deleteResultByJudgeRiderId,
  getResultsByRiderTestIdJudgeId,
};
