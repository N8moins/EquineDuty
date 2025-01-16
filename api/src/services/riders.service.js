const prisma = require('../../prisma/client');

/**
 * Add a rider
 * @param {*} data data
 * @param {int} user_id user_id
 * @return {Promise<*>} new rider
 */
async function addRider(data, user_id) {
  const {
    name, phone, email, no_fei, emergency_name,
    emergency_phone, stable_name, trainer_name,
  } = data;

  const newRider = await prisma.riders.create({
    data: {
      name,
      phone,
      email,
      no_fei,
      emergency_name,
      emergency_phone,
      stable_name,
      trainer_name,
      user_id,
    },
  });

  return newRider;
}

/**
 * Modify a rider by id
 * @param {*} data data
 * @param {int} user_id user_id
 * @param {int} rider_id rider_id
 * @return {Promise<*>} updatedRider
 */
async function modifyRiderById(data, user_id, rider_id) {
  const {
    name, phone, email, no_fei, emergency_name,
    emergency_phone, stable_name, trainer_name,
  } = data;

  const updatedRider = await prisma.riders.update({
    where: {
      id: rider_id,
      user_id: user_id,
    },
    data: {
      name,
      phone,
      email,
      no_fei,
      emergency_name,
      emergency_phone,
      stable_name,
      trainer_name,
      user_id,
    },
  });

  return updatedRider;
}

/**
 * Get a rider by id
 * @param {int} rider_id rider_id
 * @return {Promise<*>} riders
 */
async function getRiderById(rider_id) {
  const rider = await prisma.riders.findFirst({
    where: {
      id: rider_id,
    },
  });

  return rider;
}

/**
 * Get rider of a class
 * @param {int} class_id class_id
 * @return {Promise<*>} new class
 */
async function getRidersByClassId(class_id) {
  try {
    const inscriptionsInClass = await prisma.classes_Inscriptions.findMany({
      where: {
        class_id: class_id,
      },
      include: {
        inscription: {
          select: {
            rider_entry_number: true,
            rider: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                no_fei: true,
                emergency_name: true,
                emergency_phone: true,
                stable_name: true,
                trainer_name: true,
                user_id: true,
              },
            },
            horse: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Add horse to rider
    inscriptionsInClass.map((inscription) => {
      inscription.inscription.rider.horse = inscription.inscription.horse;
      inscription.inscription.rider.rider_entry_number =
      inscription.inscription.rider_entry_number;
      inscription.inscription.rider.time = 13;
    });


    return inscriptionsInClass.map((inscription) =>
      inscription.inscription.rider);
  } catch (error) {
    return error;
  }
}


/**
 * Get all riders of a user
 * @param {int} user_id user_id
 * @return {Promise<*>} riders
 */
async function getRidersOfUser(user_id) {
  const riders = await prisma.riders.findMany({
    where: {
      user_id: user_id,
    },
  });

  return riders;
}

/**
 * Delete a rider by its id
 * @param {int} user_id user_id
 * @param {int} rider_id rider_id
 * @return {Promise<*>} rider
 */
async function deleteRiderById(user_id, rider_id) {
  const rider = await prisma.riders.delete({
    where: {
      id: rider_id,
      user_id: user_id,
    },
  });

  return rider;
}

module.exports = {
  addRider,
  modifyRiderById,
  getRiderById,
  getRidersOfUser,
  deleteRiderById,
  getRidersByClassId,
};
