const prisma = require('../../prisma/client');

/**
 * Add a Test with its marks
 * @param {*} data data
 * @param {int} user_id user id
 *
 * @return {Promise<*>} new test
 */
async function addTests(data, user_id) {
  let testWithMarks;

  await prisma.$transaction(async (prisma) => {
    const {
      number,
      name,
      short_name,
      points_precision,
      duration_minute,
      nb_standard_marks,
      nb_collectives_marks,
      total_points_possibility,
      marks,
    } = data;

    // parse values of the array marks
    for (let i = 0; i < marks.length; i++) {
      marks[i].note = parseInt(marks[i].note);
      marks[i].coef_points = parseFloat(marks[i].coef_points);
    }

    const newTest = await prisma.tests.create({
      data: {
        number,
        name,
        short_name,
        points_precision: parseInt(points_precision),
        duration_minute: parseInt(duration_minute),
        nb_standard_marks: parseInt(nb_standard_marks),
        nb_collectives_marks: parseInt(nb_collectives_marks),
        total_points_possibility: parseInt(total_points_possibility),
        user_id,
        Marks: {
          createMany: {
            data: marks,
          },
        },
      },
      include: {
        Marks: true,
      },
    });

    testWithMarks = {
      test: newTest,
    };
  });
  return testWithMarks;
}

/**
 * Modify a test by its id
 * @param {*} data data
 * @param {int} test_id test_id
 *
 * @return {Promise<*>} test
 */
async function modifyTestById(data, test_id) {
  let testWithMarksModified;
  await prisma.$transaction(async (prisma) => {
    const {
      number,
      name,
      short_name,
      points_precision,
      duration_minute,
      nb_standard_marks,
      nb_collectives_marks,
      total_points_possibility,
      marks,
    } = data;

    // parse values of the array marks
    for (let i = 0; i < marks.length; i++) {
      marks[i].note = parseInt(marks[i].note);
      marks[i].coef_points = parseFloat(marks[i].coef_points);
    }

    await deleteAllMarksTest(test_id);
    const testModified = await prisma.tests.update({
      where: {
        id: test_id,
      },
      data: {
        number,
        name,
        short_name,
        points_precision: parseInt(points_precision),
        duration_minute: parseInt(duration_minute),
        nb_standard_marks: parseInt(nb_standard_marks),
        nb_collectives_marks: parseInt(nb_collectives_marks),
        total_points_possibility: parseInt(total_points_possibility),
        Marks: {
          createMany: {
            data: marks,
          },
        },
      },
      include: {
        Marks: true,
      },
    });

    testWithMarksModified = {
      test: testModified,
    };
  });
  return testWithMarksModified;
}

;
/**
 * Get test by id
 * @param {int} testId
 * @return  {Promise<*>} test
 */
async function getTestById(testId) {
  const test = await prisma.tests.findUnique({
    where: {
      id: testId,
    },
  });
  return test;
}

/**
 * delete all marks of a test
 * @param {int} test_id
 */
async function deleteAllMarksTest(test_id) {
  await prisma.marks.deleteMany({
    where: {
      test_id: test_id,
    },
  });
}

/**
 * Get all the tests for a specific user id
 * @param {int} userId user id
 * @return {Promise<*>} tests
 */
async function getTestsByUserId(userId) {
  const tests = await prisma.tests.findMany({
    where: {
      user_id: userId,
    },
  });

  return tests;
}

/**
 * Get a test with all his marks.
 * @param {Int} testId The test id.
 * @return {Promise<*>} Test.
 */
async function getTestByIdWithMarks(testId) {
  const test = await prisma.tests.findUnique({
    select: {
      id: true,
      number: true,
      name: true,
      short_name: true,
      points_precision: true,
      duration_minute: true,
      nb_collectives_marks: true,
      total_points_possibility: true,
      user: {
        select: {
          id: true,
        },
      },
      Marks: {
        select: {
          id: true,
          move_name: true,
          note: true,
          coef_points: true,
          type: true,
        },
      },
    },
    where: {
      id: testId,
    },
  });

  return test;
}

/**
 * Link test to class
 * @param {int} test_id
 * @param {int} class_id
 * @return {Promise<*>} test
 */
async function linkTest(test_id, class_id) {
  const test = await prisma.classes.update({
    where: {
      id: class_id,
    },
    data: {
      test: {
        connect: {
          id: test_id,
        },
      },
    },
  });
  return test;
}

/**
 * Delete test
 * @param {int} test_id
 * @return {Promise<*>} test
 */
async function deleteTestById(test_id) {
  const test = await prisma.tests.delete({
    where: {
      id: test_id,
    },
  });
  return test;
}

module.exports = {
  addTests,
  linkTest,
  getTestById,
  getTestsByUserId,
  getTestByIdWithMarks,
  deleteTestById,
  modifyTestById,
};
