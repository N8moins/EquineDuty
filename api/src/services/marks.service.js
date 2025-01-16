const prisma = require('../../prisma/client');

/**
 * Add a mark
 * @param {*} data data
 * @param {*} testId testId
 * @param {*} test test
 *
 * @return {Promise<*>} new mark
 */
async function addMarks(data, testId, test) {
  const {
    move_name,
    note,
    type,
    coef_points,
  } = data;

  const countStandard = await prisma.marks.findMany({
    where: {
      test_id: parseInt(testId),
      type: 'STANDARD',
    },
  });
  const countCollective = await prisma.marks.findMany({
    where: {
      test_id: parseInt(testId),
      type: 'COLLECTIVE',
    },
  });
  if (type === 'STANDARD' &&
  test.nb_standard_makrs < countStandard.length + 1) {
    return 'standard';
  }
  if (type === 'COLLECTIVE' &&
  test.nb_collectives_makrs < countCollective.length + 1) {
    return 'collective';
  }

  const newMark = await prisma.marks.create({
    data: {
      move_name,
      note: parseInt(note),
      coef_points: parseFloat(coef_points),
      type,
      test_id: parseInt(testId),
    },
  });
  return newMark;
}


module.exports = {
  addMarks,
};

