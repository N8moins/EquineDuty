const prisma = require('../../prisma/client');

/**
 * Check if rider is registered in show
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} next or error
 */
async function isRiderRegisteredAndPayedInUncompletedShow(req, res, next) {
  const currentDate = new Date();

  try {
    const rider_id = parseInt(req.params.riderId);
    const result = await prisma.inscriptions.findMany({
      where: {
        rider_id: rider_id,
        has_payed: true,
        show: {
          end_date: {
            gt: currentDate,
          },
        },
      },
    });

    if (!result || result.length === 0) {
      return next();
    }

    return res.status(403).json({
      error: 'Rider is registered in show, you cannot modify it now',
    });
  } catch (error) {
    return res.status(500).json({error: 'Internal server error'});
  }
}

/**
 * Check if rider is registered in show
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {Promise<*>} next or error
 */
async function isHorseRegisteredAndPayedInUncompletedShow(req, res, next) {
  const currentDate = new Date();

  try {
    const horse_id = parseInt(req.params.horse_id);
    const result = await prisma.inscriptions.findMany({
      where: {
        id_horse: horse_id,
        has_payed: true,
        show: {
          end_date: {
            gt: currentDate,
          },
        },
      },
    });

    if (!result || result.length === 0) {
      return next();
    }

    return res.status(403).json({
      error: 'Horse is registered in show, you cannot modify it now',
    });
  } catch (error) {
    return res.status(404).json({error: 'Not found'});
  }
}

module.exports = {
  isRiderRegisteredAndPayedInUncompletedShow,
  isHorseRegisteredAndPayedInUncompletedShow,
};
