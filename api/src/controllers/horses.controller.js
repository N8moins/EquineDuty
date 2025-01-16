const fs = require('fs');

const {
  addHorse,
  deleteHorseById,
  getHorseById,
  getHorsesByUserId,
  modifyHorseById,
} = require('../services/horses.service.js');

/**
 * POST /horse
 * @param {*} req Request.
 * @param {*} res Response.
 * @return {*} Http status code + json
 */
async function postHorse(req, res) {
  try {
    let vaccinePath = null;
    let cogginsPath = null;
    const userId = parseInt(req.params.userId);

    if (req.files['vaccine']) {
      vaccinePath = req.files['vaccine'][0].path;
    }
    if (req.files['coggins']) {
      cogginsPath = req.files['coggins'][0].path;
    }
    const result = await addHorse(userId, req.body, vaccinePath, cogginsPath);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * GET horse/id
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} horse
 */
async function getHorse(req, res) {
  try {
    const horse_id = parseInt(req.params.horseId);
    const horse = await getHorseById(horse_id);

    let _path_vaccine = horse.path_vaccine;
    let _path_coggins = horse.path_coggins;

    if (_path_vaccine !== null && _path_vaccine !== undefined) {
      _path_vaccine = horse.path_vaccine.slice(21);
    }
    if (_path_coggins !== null && _path_coggins !== undefined) {
      _path_coggins = horse.path_coggins.slice(21);
    }
    const _horse = {
      id: horse.id,
      name: horse.name,
      sex: horse.sex,
      no_fei: horse.no_fei,
      no_micro_chip: horse.no_micro_chip,
      path_vaccine: _path_vaccine,
      path_coggins: _path_coggins,
      user_id: horse.user_id,
      createAt: horse.createAt,
      updateAt: horse.updateAt,
    };
    const _owner = {
      name: horse.name_owner,
      no_fei: horse.fei_owner,
      email: horse.email_owner,
      phone: horse.phone_owner,
    };
    return res.status(200).json({
      horse: _horse,
      owner: _owner,
    });
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
* GET horses
* @param {*} req request
* @param {*} res response
* @return {Promise<*>} horse
*/
async function getHorses(req, res) {
  try {
    const user_id = parseInt(req.params.userId);
    const horses = await getHorsesByUserId(user_id);

    if (Object.keys(horses).length < 1) {
      return res.status(204).json({'message': 'Les ressource n\'existent pas'});
    }

    return res.status(200).json(horses);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * PUT horse
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} horse
 */
async function putHorse(req, res) {
  try {
    const horse_id = parseInt(req.params.horseId);
    const user_id = parseInt(req.params.userId);
    const horse = await getHorseById(parseInt(req.params.horseId));

    let vaccinePath = horse.path_vaccine;
    let cogginsPath = horse.path_coggins;

    if (horse.path_vaccine !== null && horse.path_vaccine !== undefined &&
      horse.path_vaccine !== '' && (req.body.vaccine === null ||
       req.body.vaccine === undefined || req.body.vaccine !== '')) {
      deleteFileDoc(horse.path_vaccine);
    }

    if (horse.path_coggins !== null && horse.path_coggins !== undefined &&
      horse.path_coggins !== '' && (req.body.coggins === null ||
       req.body.coggins === undefined || req.body.coggins === '')) {
      deleteFileDoc(horse.path_coggins);
    }
    if (req.files['vaccine']) {
      vaccinePath = req.files['vaccine'][0].path;
    } else if
    (req.body.vaccine !== null && req.body.vaccine !== undefined &&
      req.body.vaccine !== '') {
      vaccinePath = horse.path_vaccine;
    } else {
      vaccinePath = null;
    }

    if (req.files['coggins']) {
      deleteFileDoc(horse.path_coggins);
      cogginsPath = req.files['coggins'][0].path;
    } else if (req.body.coggins !== null &&
      req.body.coggins !== undefined && req.body.coggins !== '') {
      cogginsPath = horse.path_coggins;
    } else {
      deleteFileDoc(horse.path_coggins);
      cogginsPath = null;
    }

    const result = await modifyHorseById(req.body, user_id, horse_id,
        vaccinePath, cogginsPath);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * DELETE horse
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} horse
 */
async function deleteHorse(req, res) {
  try {
    const horse_id = parseInt(req.params.horseId);
    const horse = await getHorseById(parseInt(req.params.horseId));

    if (horse.path_vaccine !== null && horse.path_vaccine !== undefined &&
      horse.path_vaccine !== '') {
      deleteFileDoc(horse.path_vaccine);
    }

    if (horse.path_coggins !== null && horse.path_coggins !== undefined &&
      horse.path_coggins !== '') {
      deleteFileDoc(horse.path_coggins);
    }

    const result = await deleteHorseById(horse_id);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * DELETE the horse's file
 * @param {*} file file
 */
function deleteFileDoc(file) {
  try {
    fs.unlinkSync(file);
  } catch (error) {
  }
}

module.exports = {
  postHorse,
  deleteHorse,
  putHorse,
  getHorse,
  getHorses,
};
