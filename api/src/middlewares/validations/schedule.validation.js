const {Joi} = require('express-validation');

const validationSchedule = {
  body: Joi.object({
    rings: Joi.array()
        .items(
            Joi.object({
              name: Joi.string().required().regex(/^[\wÀ-ÿ'\-\s]+/),
              start_time: Joi.string().required()
                  .regex(/([01][0-9]|2[0-3]):([0-5][0-9])/),
              date: Joi.string().isoDate().required(),
              ClassSchedule: Joi.array()
                  .items(
                      Joi.object({
                        number: Joi.string().required().regex(/[0-9]+/),
                        name: Joi.string().required().regex(/^[\wÀ-ÿ'\-\s]+/),
                        duration_minute: Joi.number().integer().required()
                            .min(0),
                        test: Joi.string().required()
                            .regex(/^[\wÀ-ÿ'\-\s]+\([\wÀ-ÿ'\-\s]+\)/),
                        riders: Joi.array()
                            .items(
                                Joi.object({
                                  id: Joi.number().integer().required().min(0),
                                  // eslint-disable-next-line max-len
                                  name: Joi.string().required().regex(/^[\wÀ-ÿ'-]+(?:\s[\wÀ-ÿ'-]+)*\s[\wÀ-ÿ'-]+$/),
                                  time_start: Joi.string().required()
                                      .regex(/([01][0-9]|2[0-3]):([0-5][0-9])/),
                                  rider_entry_number: Joi.number().required()
                                      .min(0),
                                  horse: Joi.object({
                                    // eslint-disable-next-line max-len
                                    name: Joi.string().required().regex(/^[\wÀ-ÿ'\-\s]+/),
                                    id: Joi.number().integer().required()
                                        .min(0),
                                  }).required(),
                                }),
                            )
                            .required(),
                        judges: Joi.array()
                            .items(
                                Joi.object({
                                  name: Joi.string().required()
                                      // eslint-disable-next-line max-len
                                      .regex(/^[\wÀ-ÿ'-]+(?:\s[\wÀ-ÿ'-]+)*\s[\wÀ-ÿ'-]+$/),
                                  position: Joi.string().required()
                                      .pattern(/^(E|H|C|M|B)$/),
                                }),
                            )
                            .required(),
                      }),
                  )
                  .required(),
            }),
        )
        .required(),
  }),
};

/**
 * Check if each rider have a minimum of certain minutes between time start
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} next or error
 */
async function checkMinutesRiders(req, res, next) {
  const data = req.body;

  const riderInfo = [];
  for (const ring of data.rings) {
    for (const ClassSchedule of ring.ClassSchedule) {
      const riders = ClassSchedule.riders;

      for (const rider of riders) {
        const {id, name, time_start, horse} = rider;

        if (id < 0) {
          continue;
        }

        // Check if the rider is already in the array with the name and id
        const riderIndex = riderInfo.findIndex((r) => r.id === id);
        if (riderIndex === -1) {
          riderInfo.push({
            id,
            name,
            time_start,
            horse,
          });
        } else {
          // If the rider is already in the array, check if the time start
          // is at least 45 minutes after the previous time start
          const [previousHour, previousMinute] = riderInfo[
              riderIndex
          ].time_start
              .split(':')
              .map(Number);
          const [currentHour, currentMinute] = time_start
              .split(':')
              .map(Number);

          const previousTime = previousHour * 60 + previousMinute;
          const currentTime = currentHour * 60 + currentMinute;

          if (Math.abs(currentTime - previousTime) < 45) {
            return res.status(400).json({
              message: `The rider ${name} with the horse ${horse.name} ` +
                `has less than 45 minutes between the time start`,
            });
          }
        }
      }
    }
  }
  return next();
}

/**
 * Check if each horse have a minimum of certain minutes between time start
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} next or error
 */
async function checkMinutesHorses(req, res, next) {
  const data = req.body;

  const horseInfo = [];
  for (const ring of data.rings) {
    for (const ClassSchedule of ring.ClassSchedule) {
      const riders = ClassSchedule.riders;

      for (const rider of riders) {
        const {time_start, horse} = rider;

        if (horse.name === 'BREAK') {
          continue;
        }

        // Check if the horse is already in the array with the name and id
        const horseIndex = horseInfo.findIndex((h) => h.id === horse.id);
        if (horseIndex === -1) {
          horseInfo.push({
            id: horse.id,
            name: horse.name,
            time_start,
          });
        } else {
          // If the horse is already in the array, check if the time start
          // is at least 45 minutes after the previous time start
          const [previousHour, previousMinute] = horseInfo[
              horseIndex
          ].time_start
              .split(':')
              .map(Number);
          const [currentHour, currentMinute] = time_start
              .split(':')
              .map(Number);

          const previousTime = previousHour * 60 + previousMinute;
          const currentTime = currentHour * 60 + currentMinute;

          if (Math.abs(currentTime - previousTime) < 45) {
            return res.status(400).json({
              message: `The horse ${horse.name} ` +
                `has less than 45 minutes between the time start`,
            });
          }
        }
      }
    }
  }
  return next();
}

module.exports = {
  validationSchedule,
  checkMinutesRiders,
  checkMinutesHorses,
};
