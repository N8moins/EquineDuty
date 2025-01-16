const {
  fetchAllShows,
  deleteById,
  showById,
  showByIdNotLogged,
  showAdminById,
  createShow,
  fetchAdminShows,
  updateShow,
  fetchAllNotLoggedShows,
  publishShowById,
  updateShowPublished,
  showInscriptions,
  removeOrganizerShowRemaining,
} = require('../services/shows.service.js');
const fs = require('fs');
const {
  getClassesNotInScheduleByShow,
} = require('../services/classes.service.js');
const {
  isScheduleExist,
  getSchedule,
} = require('../services/schedule.service.js');

/**
 * Function that allows the user to fetch all the ongoing shows
 *
 * @author Nathan Lessard
 *
 * @param {*} req request
 * @param {*} res response
 *
 * @return {Promise<*>} shows
 */
async function findAll(req, res) {
  try {
    const allShows = await fetchAllShows(req);
    if (allShows.data === undefined || allShows.data.length === 0) {
      return res.status(204).json({data: 'La ressource n\'existe pas'});
    }
    return res.status(200).json(allShows);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Function that allows the user to fetch all the shows with less information
 *
 * @author Nathan Lessard
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} shows
 */
async function notLoggedShows(req, res) {
  try {
    const shows = await fetchAllNotLoggedShows(req);
    if (shows.data === undefined || shows.data.length === 0) {
      return res.status(204).json({data: 'La ressource n\'existe pas'});
    }
    return res.status(200).json(shows);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 *  Get show by its id
 * @author Nathan Lessard
 *
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} show
 */
async function getShowById(req, res) {
  try {
    const showId = parseInt(req.params.showId);
    const show = await showById(showId);

    if (show === undefined || show.length === 0) {
      // si on met 404 react query n'aime pas ça
      return res.status(204).json({data: 'La ressource n\'existe pas'});
    }
    return res.status(200).json(show);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 *  Get show by its id while not being logged.
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} show
 */
async function getShowByIdNotLogged(req, res) {
  try {
    const showId = parseInt(req.params.showId);
    const show = await showByIdNotLogged(showId);

    if (show === undefined) {
      return res.status(204);
    }
    return res.status(200).json(show);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Allows delete the show by its id
 *
 * @author Nathan Lessard
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} competition
 */
async function deleteShowById(req, res) {
  try {
    const {showId} = req.params;
    const deletedCompetition = await deleteById(showId);
    if (deletedCompetition === undefined || deletedCompetition.length === 0) {
      return res.status(404).json('La ressource n\'existe pas');
    }
    return res.status(200).json({
      data: deletedCompetition,
    });
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Post show
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} show
 */
async function postShow(req, res) {
  try {
    let logoShowPath = null;
    if (req.files['show_logo']) {
      logoShowPath = req.files['show_logo'][0].path;
      const parts = logoShowPath.split('/');
      // this part might crash if the image path changes
      logoShowPath = parts[3];
    }
    const show = await createShow(req.body, req.user.id, logoShowPath);
    await removeOrganizerShowRemaining(req.user);

    return res.status(201).json({data: show});
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Function that allows the user to fetch all the shows
 *
 * @author API Nathan Lessard
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} shows
 */
async function getAdminShows(req, res) {
  try {
    const userId = parseInt(req.user.id);
    const allShows = await fetchAdminShows(userId, req.user.role);

    if (allShows.length > 0) {
      return res.status(200).json({data: allShows});
    }
    return res.status(204).json({error: 'No shows found'});
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Get show by its id for admin
 * @author Nathan Lessard
 *
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} show
 */
async function getShowAdminById(req, res) {
  try {
    const showId = parseInt(req.params.showId);
    const show = await showAdminById(showId);
    if (show === undefined || show.length === 0) {
      return res.status(204).json({data: 'La ressource n\'existe pas'});
    }
    return res.status(200).json(show);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Update show by its id
 * @author Nathan Lessard
 *
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} show
 */
async function updateShowById(req, res) {
  try {
    const showId = parseInt(req.params.showId);
    let show = await showAdminById(showId);

    if (show.is_published) {
      show = await updateShowPublished(req.body, showId);
    } else {
      let logoShowPath = null;
      if (req.files['show_logo']) {
        logoShowPath = req.files['show_logo'][0].path;
        const parts = logoShowPath.split('/');
        // this part might crash if the image path changes
        logoShowPath = parts[3];
      }
      if (
        show.path_logo !== null &&
        show.path_logo !== undefined &&
        show.path_logo !== ''
      ) {
        deleteFileDoc(show.path_logo);
      }
      show = await updateShow(req.body, showId, logoShowPath);
    }

    return res.status(200).json({data: show});
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * publish a show
 * @author Nathan Lessard
 *
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} show
 */
async function publishShow(req, res) {
  try {
    const show = await publishShowById(req, req.params.showId);
    return res.status(200).json({message: show});
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Get all classes for a show by date for admin
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} classes
 */
async function getShowAdminClassesByDate(req, res) {
  try {
    const show_id = parseInt(req.params.showId);
    const _date = req.params.dateToCheck;

    if (await isScheduleExist(show_id, _date)) {
      const schedule = await getSchedule(show_id, _date);
      return res.status(200).json({is_schedule: true, data: schedule});
    }

    const classes = await getClassesNotInScheduleByShow(show_id);

    if (classes === undefined || classes.length === 0) {
      return res.status(204).json({data: 'La ressource n\'existe pas'});
    }

    const classesWithIsSchedule = {
      is_schedule: false,
      data: [...classes],
    };

    return res.status(200).json(classesWithIsSchedule);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * Get all inscriptions for a show
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} inscriptions
 */
async function getShowInscriptions(req, res) {
  try {
    const show_id = parseInt(req.params.showId);
    const has_payed = req.query.has_payed;

    const show = await showInscriptions(show_id, has_payed);
    if (show === undefined || show.length === 0) {
      return res.status(204).json({data: 'La ressource n\'existe pas'});
    }

    return res.status(200).json(show);
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
  } catch (error) {}
}

module.exports = {
  findAll,
  notLoggedShows,
  deleteShowById,
  getShowById,
  getShowByIdNotLogged,
  getShowAdminById,
  getAdminShows,
  postShow,
  updateShowById,
  publishShow,
  getShowInscriptions,
  getShowAdminClassesByDate,
  deleteFileDoc,
};
