const {
  getDuplicatedHorsesAndInscriptionId,
  getInscriptionsByShow,
  getDuplicatedRidersAndInscriptionId,
  getAllClassesInShow,
  getClassesOrderShared,
  getAllClassesInInscription,
  getRidersForEachClasses,
  getHorsesForEachClasses,
  createSchedule,
  getAllTestsInClasses,
  getRingClasses,
  getAllJudgesInClasses,
  bdSchedule,
} = require('../services/schedule.service');

// Disable no-unused-vars eslint rule for the entire file
// if we are redoing the automatic generating
/* eslint-disable no-unused-vars */

/**
 * POST /schedule
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} schedule
 */
async function postSchedule(req, res) {
  try {
    const showId = parseInt(req.params.showId);

    const result = await logicSchedule(showId, res);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Logic for creating a schedule
 * @param {int} showId show id
 * @param {*} res response
 */
async function logicSchedule(showId, res) {
  const inscriptions = await getInscriptionsByShow(showId);

  if (!inscriptions) {
    return res.status(204);
  }

  //  Format : {"id": 1, "horse_id": 1}
  const sharedHorses = await getDuplicatedHorsesAndInscriptionId(
      inscriptions,
  );

  // Format : {"id": 1, "rider_id": 1}
  const sharedRiders = await getDuplicatedRidersAndInscriptionId(
      inscriptions,
  );

  const classesInShow = await getAllClassesInShow(showId);

  const classesInInscription = await getAllClassesInInscription(inscriptions);

  // Will be the order of the classes in the schedule.
  // This is in descening order, so the most shared horses will be first.
  // Only the classesId in an array
  // Format: [1, 2, 3]
  const classesOrderShared = await getClassesOrderShared(inscriptions);

  const ridersForEachClasses = await getRidersForEachClasses(inscriptions);

  const horsesForEachClasses = await getHorsesForEachClasses(
      inscriptions,
      classesOrderShared,
  );

  const testsInInscriptions = await getAllTestsInClasses(classesInShow);
  const classesid = classesInShow.map((c) => c.id);
  const judgesInClasses = await getAllJudgesInClasses(classesid);

  classesInShow.forEach((c) => {
    c.judges = judgesInClasses.filter((j) => j.class_id === c.id);
  });

  const ringClasses = await getRingClasses(classesInShow);

  const schedule = await createSchedule(testsInInscriptions, ringClasses);

  return schedule;
}

/**
 * POST /schedule/date/:date/confirmSchedule
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} schedule
 */
async function confirmSchedule(req, res) {
  try {
    const showId = parseInt(req.params.showId);
    const date = req.params.date;

    await bdSchedule(req.body, showId, date);

    return res.status(201).json({message: 'schedule.creationSuccess'});
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

module.exports = {
  postSchedule,
  confirmSchedule,
};
