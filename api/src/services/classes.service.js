const prisma = require('../../prisma/client');
const {getRidersByClassId} = require('./riders.service.js');

/**
 * Add a class with its judges and test
 * @param {*} data data
 * @param {int} show_id show_id
 * @return {Promise<*>} new class
 */
async function addClasses(data, show_id) {
  const {
    number,
    name,
    date,
    price_entry,
    is_test_of_choice,
    level_type,
    ring_name,
    ring_number,
    test_id,
    judges,
  } = data;

  const newClass = await prisma.classes.create({
    data: {
      number: number,
      name: name,
      date: new Date(date),
      price_entry: parseInt(price_entry),
      is_test_of_choice: Boolean(is_test_of_choice),
      level_type: level_type,
      ring_name: ring_name,
      ring_number: ring_number,
      show_id,
      test_id: parseInt(test_id),
      Judges_Classes: {
        createMany: {
          data: judges,
        },
      },
    },
    include: {
      test: true,
      Judges_Classes: true,
    },
  });
  return newClass;
}

/**
 * Modify a class, its judges and test
 * @param {*} data data
 * @param {int} class_id class_id
 * @return {Promise<*>} new class
 */
async function modifyClassById(data, class_id) {
  let updatedClass;

  await prisma.$transaction(async (prisma) => {
    const {
      number,
      name,
      date,
      price_entry,
      is_test_of_choice,
      level_type,
      ring_name,
      ring_number,
      test_id,
      judges,
    } = data;

    await deleteAllJudgesClass(class_id);

    updatedClass = await prisma.classes.update({
      where: {
        id: class_id,
      },
      data: {
        number: number,
        name: name,
        date: new Date(date),
        price_entry: parseInt(price_entry),
        is_test_of_choice: Boolean(is_test_of_choice),
        level_type: level_type,
        ring_name: ring_name,
        ring_number: ring_number,
        test_id: parseInt(test_id),
        Judges_Classes: {
          createMany: {
            data: judges,
          },
        },
      },
      include: {
        test: true,
        Judges_Classes: true,
      },
    });
  });
  return updatedClass;
}

/**
 * delete all judge of a class
 * @param {int} class_id
 */
async function deleteAllJudgesClass(class_id) {
  await prisma.judges_Classes.deleteMany({
    where: {
      class_id: class_id,
    },
  });
}

/**
 * Get all classes by show id
 * @param {int} show_id show_id
 * @return {Promise<*>} classes
 */
async function getClassesByShowId(show_id) {
  const _classes = await prisma.classes.findMany({
    where: {
      show_id: show_id,
    },
  });

  return _classes;
}

/**
 * Get judges by class id
 *
 * @param {int} class_id class_id
 * @return {Promise<*>} class
 */
async function getJudgesByClassId(class_id) {
  const judges = await prisma.judges_Classes.findMany({
    where: {
      class_id: class_id,
    },
  });
  return judges;
}

/**
 * Get judges by class id
 *
 * @param {int} judge_id judge_id
 * @return {Promise<*>} judge
 */
async function getJudgeById(judge_id) {
  const judge = await prisma.judges_Classes.findUnique({
    where: {
      id: judge_id,
    },
  });
  return judge;
}

/**
 * Get class with test id
 * @param {int} test_id user id
 * @return {Promise<*>} tests
 */
async function getClassWithTestId(test_id) {
  const classe = await prisma.classes.findFirst({
    where: {
      test_id: test_id,
    },
  });

  return classe;
}

/**
 * Get class by id
 * @param {int} class_id class_id
 * @return {Promise<*>} class
 */
async function getClassById(class_id) {
  const classe = await prisma.classes.findUnique({
    where: {
      id: class_id,
    },
  });

  return classe;
}

/**
 * Get class by id
 *
 * @param {int} class_id class_id
 * @param {int} show_id user_id
 * @return {Promise<*>} class
 */
async function getClassByIdAndShow(class_id, show_id) {
  const classe = await prisma.classes.findUnique({
    where: {
      id: class_id,
      show_id: show_id,
    },
    select: {
      id: true,
      number: true,
      name: true,
      date: true,
      ring_name: true,
      ring_number: true,
      price_entry: true,
      show_id: true,
      Judges_Classes: {
        select: {
          id: true,
          ring_name: true,
          name: true,
          ring_position: true,
        },
      },
      test: {
        select: {
          id: true,
          name: true,
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
      },
      level_type: true,
      is_test_of_choice: true,
    },
  });

  return classe;
}

/**
 * Delete a class by its id
 * @param {int} class_id class_id
 * @return {Promise<*>} class
 */
async function deleteClassById(class_id) {
  const classe = await prisma.classes.delete({
    where: {
      id: class_id,
    },
  });

  return classe;
}

/**
 * Get all classes by date in a show
 *
 * @param {int} show_id
 * @param {Date} date
 * @return {Promise<*>} classes
 */
async function getClassesNotInScheduleByShow(show_id) {
  const _classes = await prisma.classes.findMany({
    where: {
      show_id: show_id,
    },
    include: {
      test: {
        select: {
          duration_minute: true,
          short_name: true,
        },
      },
    },
  });

  const scheduleForShow = await prisma.schedule.findMany({
    where: {
      show_id: show_id,
    },
  });

  if (scheduleForShow === null) {
    return _classes;
  }

  const ringInSchedule = await prisma.ring_Schedule.findMany({
    where: {
      schedule_id: {
        in: scheduleForShow.map((schedule) => schedule.id),
      },
    },
  });

  const classNumberInSchedule = await prisma.class_Schedule.findMany({
    where: {
      ring_schedule_id: {
        in: ringInSchedule.map((ring) => ring.id),
      },
    }});

  const classesNotInSchedules = _classes.filter((classe) => {
    return !classNumberInSchedule.some((classSchedule) => {
      return classSchedule.number === classe.number;
    });
  });

  const ridersArr = await Promise.all(
      classesNotInSchedules.map(async (classe) => {
        const rider = await getRidersByClassId(classe.id);
        const riderObj = rider.map((rider) => {
          return {
            id: rider.id,
            name: rider.name,
            time_start: '00:00',
            rider_entry_number: rider.rider_entry_number,
            horse: rider.horse,
          };
        });
        return {
          ...classe,
          riders: riderObj,
        };
      }),
  );
  const judgesArr = await Promise.all(
      ridersArr.map(async (classe) => {
        const judge = await getJudgesByClassId(classe.id);

        const judgeObj = judge.map((judge) => {
          return {
            name: judge.name,
            position: judge.ring_position,
          };
        });
        return {
          ...classe,
          judges: judgeObj,
        };
      }),
  );

  const finalObject = judgesArr.map((classe) => {
    return {
      number: classe.number,
      name: classe.name,
      duration_minute: classe.test.duration_minute,
      test: classe.test.short_name,
      riders: classe.riders,
      judges: classe.judges,
    };
  });

  return finalObject;
}

module.exports = {
  addClasses,
  deleteClassById,
  modifyClassById,
  getClassById,
  getClassByIdAndShow,
  getClassesByShowId,
  getJudgesByClassId,
  getClassWithTestId,
  getClassesNotInScheduleByShow,
  getJudgeById,
};
