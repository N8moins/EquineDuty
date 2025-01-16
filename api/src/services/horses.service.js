const prisma = require('../../prisma/client');

/**
 * Add a horse
 * @param {int} user_id Id of the user
 * @param {json} data Data from the form
 * @param {string} path_vaccine Path of the save file
 * @param {string} path_coggins Path of the save file
 * @return {Promise} Db response
 */
async function addHorse(user_id, data, path_vaccine, path_coggins) {
  const {
    name,
    sex,
    no_fei,
    no_micro_chip,
    email_owner,
    fei_owner,
    name_owner,
    phone_owner,
  } = data;

  const newHorse = await prisma.horses.create({
    data: {
      name,
      sex,
      no_fei,
      no_micro_chip,
      path_vaccine,
      path_coggins,
      email_owner,
      fei_owner,
      name_owner,
      phone_owner,
      user_id,
    },
  });

  return newHorse;
}

/**
 * Get horses by user id
 * @param {int} user_id user_id
 *
 * @return {Promise<*>} horses
 */
async function getHorsesByUserId(user_id) {
  const horses = await prisma.horses.findMany({
    where: {
      user_id: user_id,
    },
  });
  return horses;
}


/**
 * Get horse by id
 * @param {int} horse_id horse_id
 *
 * @return {Promise<*>} horse
 */
async function getHorseById(horse_id) {
  const horse = await prisma.horses.findUnique({
    where: {
      id: horse_id,
    },
  });

  return horse;
}

/**
 * Modify a horse by its id
 * @param {*} data data
 * @param {int} user_id user_id
 * @param {int} horse_id horse_id
 * @param {string} path_vaccine vaccinePath
 * @param {string} path_coggins cogginsPath
 *
 * @return {Promise<*>} horse
 */
async function modifyHorseById(data, user_id, horse_id,
    path_vaccine, path_coggins) {
  const {
    name,
    sex,
    email,
    no_fei,
    no_micro_chip,
    email_owner,
    fei_owner,
    name_owner,
    phone_owner,
  } = data;

  const updatedHorse = await prisma.horses.update({
    where: {
      id: horse_id,
      user_id: user_id,
    },
    data: {
      name,
      sex,
      email,
      no_fei,
      no_micro_chip,
      path_vaccine,
      path_coggins,
      email_owner,
      fei_owner,
      name_owner,
      phone_owner,
    },
  });

  return updatedHorse;
}

/**
 * Delete a horse by its id
 * @param {int} horse_id horse_id
 *
 * @return {Promise<*>} horse
 */
async function deleteHorseById(horse_id) {
  const horse = await prisma.horses.delete({
    where: {
      id: horse_id,
    },
  });

  return horse;
}


module.exports = {
  addHorse,
  getHorseById,
  deleteHorseById,
  modifyHorseById,
  getHorsesByUserId,
};
