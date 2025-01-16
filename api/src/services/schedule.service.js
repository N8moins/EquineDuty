const prisma = require('../../prisma/client');
const {
  getClassesNotInScheduleByShow,
} = require('./classes.service');
const {getRidersByClassId} = require('./riders.service');
/**
 * Get all classes for a show
 * @param {int} showId show id
 * @return {Promise<*>} classes
 */
async function getAllClassesInShow(showId) {
  const classes = await prisma.classes.findMany({
    where: {
      show_id: showId,
    },
  });

  for (const classItem of classes) {
    const test = await prisma.tests.findFirst({
      where: {
        id: classItem.test_id,
      },
    });
    classItem.duration_minute = test.duration_minute;
  }

  return classes;
}

/**
 * Get all classes for a show separated by level_type
 * @param {int} showId show id
 * @return {Promise<*>} classes
 */
async function getAllClassesSeparetedByLevelType(showId) {
  const classes = await prisma.classes.findMany({
    where: {
      show_id: showId,
    },
  });

  const classesByLevelType = classes.reduce((acc, classItem) => {
    if (!acc[classItem.level_type]) {
      acc[classItem.level_type] = [];
    }
    acc[classItem.level_type].push(classItem);
    return acc;
  }, {});

  return classesByLevelType;
}

/**
 * Get inscriptions by show
 * @param {int} showId
 * @return {Promise<*>} inscriptions
 */
async function getInscriptionsByShow(showId) {
  const inscriptions = await prisma.inscriptions.findMany({
    where: {
      show_id: showId,
    },
  });

  for (const inscription of inscriptions) {
    const classInscription = await prisma.classes_Inscriptions.findFirst({
      where: {
        inscription_id: inscription.id,
      },
      include: {
        class: true,
      },
    });

    inscription.class_id = classInscription.class.id;
  }

  return inscriptions;
}

/**
 * Get duplicated horses id with the inscription id from inscriptions
 * @param {Array} inscriptions
 *
 * @return {Promise<*>} duplicatedHorses with the inscription id
 */
async function getDuplicatedHorsesAndInscriptionId(inscriptions) {
  const horses = inscriptions.map((inscription) => inscription.horse_id);

  const duplicatedHorses = horses.filter((horse, index) => {
    return horses.indexOf(horse) !== index;
  });

  // Only return the duplicated horses id with the inscription id
  const duplicatedHorsesInscriptions = inscriptions.filter((inscription) => {
    return duplicatedHorses.includes(inscription.horse_id);
  });

  return duplicatedHorsesInscriptions.map(({id, horse_id}) => ({
    id,
    horse_id,
  }));
}

/**
 * Get duplicated riders id with the inscription id from inscriptions
 * @param {Array} inscriptions
 * @return {Promise<*>} duplicatedRiders with the inscription id
 */
async function getDuplicatedRidersAndInscriptionId(inscriptions) {
  const riders = inscriptions.map((inscription) => inscription.rider_id);

  const duplicatedRiders = riders.filter((rider, index) => {
    return riders.indexOf(rider) !== index;
  });

  // Only return the duplicated riders id with the inscription id
  const duplicatedRidersInscriptions = inscriptions.filter((inscription) => {
    return duplicatedRiders.includes(inscription.rider_id);
  });

  return duplicatedRidersInscriptions.map(({id, rider_id}) => ({
    id,
    rider_id,
  }));
}
/**
 * Get the order of the classes in the schedule
 * @param {Object} inscriptions
 * @param {Object} classesInShow
 * @return {Array} classesOrder
 */
async function getClassesOrderShared(inscriptions) {
  const classesIdWithMostSharedHorses = await getClassesIdWithMostSharedHorses(
      inscriptions,
  );

  const classIdWithMostSharedRiders = await getClassesIdWithMostSharedRiders(
      inscriptions,
  );

  const classesOrder = {};

  [classesIdWithMostSharedHorses, classIdWithMostSharedRiders].forEach(
      (classes) => {
        for (const classId in classes) {
          if (classes.hasOwnProperty(classId)) {
            const counts = Object.values(classes[classId]);
            const total = counts.reduce((acc, count) => acc + count, 0);
            classesOrder[classId] = (classesOrder[classId] || 0) + total;
          }
        }
      },
  );
  const classesOrderArray = Object.entries(classesOrder).sort(compareByValue);
  return classesOrderArray.map(([classId]) => parseInt(classId));
}

/**
 * Compare by value
 * @param {int} a
 * @param {int} b
 * @return {int} b[1] - a[1]
 */
function compareByValue(a, b) {
  return b[1] - a[1];
}

/**
 * Get classes with the most shared horses
 * @param {Object} inscriptions
 * @param {Array} classesInShow
 *
 * Format: {class_id: {horse_id: count}}
 *  If the count is less than 2, I don't include it.
 * @return {*} class in inscription in desc order of shared horses
 */
async function getClassesIdWithMostSharedHorses(inscriptions) {
  const memo = {};
  inscriptions.forEach((inscription) => {
    const {class_id, horse_id} = inscription;
    if (!memo[class_id]) {
      memo[class_id] = {};
    }
    if (!memo[class_id][horse_id]) {
      memo[class_id][horse_id] = 1;
    } else {
      memo[class_id][horse_id]++;
    }
  });
  Object.keys(memo).forEach((class_id) => {
    Object.keys(memo[class_id]).forEach((horse_id) => {
      if (memo[class_id][horse_id] < 2) {
        delete memo[class_id][horse_id];
      }
    });
    if (Object.keys(memo[class_id]).length === 0) {
      delete memo[class_id];
    }
  });

  return memo;
}

/**
 * Get classes with the most shared riders
 * @param {Object} inscriptions
 * @param {Array} classesInShow
 *
 * Format: {class_id: {rider_id: count}}
 * @return {*} class in inscription in desc order of shared horses
 */
async function getClassesIdWithMostSharedRiders(inscriptions) {
  const memo = {};
  inscriptions.forEach((inscription) => {
    const {class_id, rider_id} = inscription;
    if (!memo[class_id]) {
      memo[class_id] = {};
    }
    if (!memo[class_id][rider_id]) {
      memo[class_id][rider_id] = 1;
    } else {
      memo[class_id][rider_id]++;
    }
  });
  Object.keys(memo).forEach((class_id) => {
    Object.keys(memo[class_id]).forEach((rider_id) => {
      if (memo[class_id][rider_id] < 2) {
        delete memo[class_id][rider_id];
      }
    });
    if (Object.keys(memo[class_id]).length === 0) {
      delete memo[class_id];
    }
  });

  return memo;
}

/**
 * Get all classes in inscription
 * @param {*} inscriptions
 *
 * @return {Array} with all classes in the inscription
 */
async function getAllClassesInInscription(inscriptions) {
  const classesId = inscriptions.map((inscription) => inscription.class_id);
  return classesId;
}

/**
 * Get the riders for each classes
 *
 * @param {Array} inscriptions
 * @param {Array} classesOrderShared
 *
 * @return {Array} each rider id for each class
 * Format: {class_id: [rider_id, rider_id]}
 */
async function getRidersForEachClasses(inscriptions, classesOrderShared) {
  const ridersForEachClasses = {};

  /* classesOrderShared.forEach((classId) => {
    const riders = inscriptions
        .filter((inscription) => inscription.class_id === classId)
        .map((inscription) => inscription.rider_id);
    ridersForEachClasses[classId] = riders;
  }); */

  return ridersForEachClasses;
}

/**
 * Get the horses for each classes
 * @param {Array} inscriptions
 * @param {Array} classesOrderShared
 * @return {Array} each horse id for each class
 * Format: {class_id: [horse_id, horse_id]}
 */
async function getHorsesForEachClasses(inscriptions, classesOrderShared) {
  const horsesForEachClasses = {};

  classesOrderShared.forEach((classId) => {
    const horses = inscriptions
        .filter((inscription) => inscription.class_id === classId)
        .map((inscription) => inscription.horse_id);
    horsesForEachClasses[classId] = horses;
  });

  return horsesForEachClasses;
}

/**
 * Get all tests in inscription
 * @param {Array} classesInShow
 * @return {Array} tests
 */
async function getAllTestsInClasses(classesInShow) {
  const tests_id = classesInShow.map((classItem) => classItem.test_id);
  const tests = await prisma.tests.findMany({
    where: {
      id: {
        in: tests_id,
      },
    },
  });

  return tests;
}

/**
 * Get ring classes object
 * @param {Array} classesInShow
 *
 * @return {Promise<*>} ringClasses
 */
async function getRingClasses(classesInShow) {
  const ringClasses = classesInShow.reduce((acc, classItem) => {
    const {ring_name} = classItem;
    const classObject = {
      ...classItem,
    };
    acc.push({
      ring_name,
      classes: [classObject],
    });
    return acc;
  }, []);

  return ringClasses;
}

/**
 * Get all the judges in classes
 * @param {int} classesId
 * @return {Promise<*>} judges
 */
async function getAllJudgesInClasses(classesId) {
  const judges = await prisma.judges_Classes.findMany({
    where: {
      class_id: {
        in: classesId,
      },
    },
  });

  return judges;
}

/**
 * Create a schedule
 * @param {Array} testsInInscriptions all tests in inscription
 * @param {Array} ringClasses ring classes object
 * @return {Array} schedule
 */
async function createSchedule(testsInInscriptions, ringClasses) {
  const schedule = {};
  const rings = [];

  for (const ring of ringClasses) {
    const _ring = {};
    const name = ring.ring_name;
    const number = ring.ring_number;
    const classes = [];

    const _class = {};
    for (const classItem of ring.classes) {
      _class.number = classItem.number;
      _class.name = classItem.name;
      _class.duration_minute = classItem.duration_minute;
      _class.judges = [];
      for (const judge of classItem.judges) {
        const _judge = {};
        _judge.name = judge.name;
        _judge.position = judge.ring_position;
        _class.judges.push(_judge);
      }

      _class.test = testsInInscriptions.find(
          (test) => test.id === classItem.test_id,
      ).short_name;

      _class.riders = [];
      const ridersForClass = await getRidersByClassId(classItem.id);
      for (const rider of ridersForClass) {
        const _rider = {};
        _rider.time_start = '00:00 AM';
        _rider.number = rider.id;
        _rider.name = rider.name;
        _rider.horse = rider.horse;
        _class.riders.push(_rider);
      }
      classes.push(_class);
    }

    _ring.name = name;
    _ring.number = number;
    _ring.classes = classes;

    rings.push(_ring);
  }

  schedule.id = -1;
  schedule.rings = rings;
  return schedule;
}

/**
 * Register in bd the schedule
 * @param {*} data
 * @param {int} showId
 * @param {string} date
 * Yes a string not a date type
 */
async function bdSchedule(data, showId, date) {
  try {
    if (await isScheduleExist(showId, date)) {
      await prisma.schedule.deleteMany({
        where: {
          show_id: showId,
        },
      });
    }
    const transaction = prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.create({
        data: {
          show_id: showId,
        },
      });

      const {rings} = data;
      for (const ring of rings) {
        const {name, start_time, date, ClassSchedule} = ring;

        const ring_schedule = await tx.ring_Schedule.create({
          data: {
            schedule_id: schedule.id,
            name,
            start_time,
            date,
          },
        });

        for (const classItem of ClassSchedule) {
          const {number, name, duration_minute, test, riders, judges} =
            classItem;

          const class_schedule = await tx.class_Schedule.create({
            data: {
              ring_schedule_id: ring_schedule.id,
              number,
              name,
              duration_minute,
              test,
            },
          });

          for (const rider of riders) {
            const {id, name, time_start, rider_entry_number, horse} = rider;

            await tx.riders_Schedule.create({
              data: {
                class_schedule_id: class_schedule.id,
                rider_id: id,
                name,
                time_start,
                rider_entry_number,
                horse_name: horse.name,
                horse_id: horse.id,
              },
            });
          }

          for (const judge of judges) {
            const {name, position} = judge;

            await tx.judges_Schedule.create({
              data: {
                class_schedule_id: class_schedule.id,
                name,
                position,
              },
            });
          }
        }
      }
    });

    return transaction;
  } catch (error) {
  }
}

/**
 * check if a schedule exist
 * @param {int} showId show id
 * @param {string} date date
 * @return {bool} schedule
 */
async function isScheduleExist(showId, date) {
  const schedule = await prisma.schedule.findMany({
    where: {
      show_id: showId,
    },
  });

  if (schedule === null) {
    return false;
  }

  const ring_schedule = await prisma.ring_Schedule.findFirst({
    where: {
      schedule_id: schedule.id,
      date,
    },
  });

  return ring_schedule !== null;
}

/**
 * Get a schedule
 * @param {int} showId
 * @param {string} _date
 * @return {Promise<*>} schedule
 */
async function getSchedule(showId, _date) {
  const scheduleObject = await prisma.schedule.findFirst({
    where: {
      show_id: showId,
      Ring_Schedule: {
        some: {
          date: _date,
        },
      },
    },
    select: {
      Ring_Schedule: {
        select: {
          name: true,
          start_time: true,
          date: true,
          Class_Schedule: {
            select: {
              number: true,
              name: true,
              duration_minute: true,
              test: true,
              Riders_Schedule: {
                select: {
                  rider_id: true,
                  name: true,
                  time_start: true,
                  rider_entry_number: true,
                  horse_name: true,
                  horse_id: true,
                },
              },
              Judges_Schedule: {
                select: {
                  name: true,
                  position: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const renamed = scheduleObject.Ring_Schedule.map((ring) => {
    const renamedToClassSchedule = ring.Class_Schedule.map((classItem) => {
      const renamedToRiders = classItem.Riders_Schedule.map((rider) => {
        return {
          id: rider.rider_id,
          name: rider.name,
          time_start: rider.time_start,
          rider_entry_number: rider.rider_entry_number,
          horse: {
            id: rider.horse_id,
            name: rider.horse_name,
          },
        };
      });

      const renamedToJudges = classItem.Judges_Schedule.map((judge) => {
        return {
          name: judge.name,
          position: judge.position,
        };
      });

      return {
        number: classItem.number,
        name: classItem.name,
        duration_minute: classItem.duration_minute,
        test: classItem.test,
        riders: renamedToRiders,
        judges: renamedToJudges,
      };
    });

    return {
      name: ring.name,
      start_time: ring.start_time,
      date: ring.date,
      ClassSchedule: renamedToClassSchedule,
    };
  });

  const finalClassNotInSchedule = await getClassesNotInScheduleByShow(showId);


  const objClassNotInSchedule = finalClassNotInSchedule.map((classe) => {
    return {
      number: classe.number,
      name: classe.name,
      duration_minute: classe.duration_minute,
      test: classe.test,
      riders: classe.riders.map((rider) => {
        return {
          id: rider.id,
          name: rider.name,
          time_start: '00:00 AM',
          rider_entry_number: rider.rider_entry_number,
          horse: {
            id: rider.horse.id,
            name: rider.horse.name,
          },
        };
      }),
      judges: classe.judges.map((judge) => {
        return {
          name: judge.name,
          position: judge.position,
        };
      })};
  });

  return {rings: renamed, classes: objClassNotInSchedule};
}

module.exports = {
  getDuplicatedHorsesAndInscriptionId,
  getInscriptionsByShow,
  getDuplicatedRidersAndInscriptionId,
  getAllClassesInShow,
  getClassesOrderShared,
  getAllClassesSeparetedByLevelType,
  getAllClassesInInscription,
  getRidersForEachClasses,
  getHorsesForEachClasses,
  createSchedule,
  getAllTestsInClasses,
  getRingClasses,
  getAllJudgesInClasses,
  bdSchedule,
  isScheduleExist,
  getSchedule,
};
