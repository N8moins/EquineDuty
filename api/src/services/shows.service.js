const prisma = require('../../prisma/client');

const show = {
  id: true,
  name: true,
  organizer: {
    select: {
      name: true,
    },
  },
  path_logo: true,
  nb_free_place: true,
  nb_total_place: true,
  nb_free_permanent_stalls: true,
  nb_free_temp_stalls: true,
  nb_free_tack_stalls: true,
  start_date: true,
  end_date: true,
  address: {
    select: {
      street_address: true,
      city: true,
      province: true,
      country: true,
      zip_code: true,
    },
  },
};
const secretary = {
  secretary: {
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  },
};

const adminShow = {
  id: true,
  name: true,
  address: {
    select: {
      id: true,
      street_address: true,
      province: true,
      country: true,
      zip_code: true,
    },
  },
  nb_free_permanent_stalls: true,
  nb_free_temp_stalls: true,
  nb_free_tack_stalls: true,
  nb_temp_stalls: true,
  nb_permanent_stalls: true,
  nb_tack_stalls: true,
  organizer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birthdate: true,
    },
  },
  path_logo: true,
  nb_free_place: true,
  nb_total_place: true,
  show_fees: {
    select: {
      id: true,
      hay: true,
      chiving: true,
      permanent_stall_per_day: true,
      temp_stall_per_day: true,
      tack_stall_per_day: true,
      drug_test: true,
    },
  },
  administration_fee: {
    select: {
      id: true,
      administration: true,
      late_inscription: true,
      cancel_inscription: true,
      ground: true,
      paramedics: true,
      camper_ground_rental: true,
    },
  },
  Shows_Packages: {
    select: {
      id: true,
    },
  },
  secretary: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birthdate: true,
    },
  },
  Classes: {
    select: {
      id: true,
      name: true,
      number: true,
      Judges_Classes: {
        select: {
          name: true,
          ring_position: true,
        },
      },
    },
  },
  show_aksed_code: {
    select: {
      asked_code_name: true,
    },
  },
  recognized_show: true,
  rules: true,
  start_date: true,
  end_date: true,
  is_vaccination_proof_required: true,
  is_coggins_proof_required: true,
  is_published: true,
  inscription_start_date: true,
  inscription_end_date: true,
  inscription_end_late_date: true,
};

const oneShow = {
  id: true,
  name: true,
  address: {
    select: {
      id: true,
      street_address: true,
      province: true,
      country: true,
      zip_code: true,
    },
  },
  organizer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  secretary: {
    select: {
      name: true,
    },
  },
  Classes: {
    select: {
      id: true,
      name: true,
    },
  },
  path_logo: true,
  nb_free_place: true,
  nb_total_place: true,
  nb_free_permanent_stalls: true,
  nb_free_temp_stalls: true,
  nb_free_tack_stalls: true,
  show_fees: {
    select: {
      hay: true,
      chiving: true,
      permanent_stall_per_day: true,
      temp_stall_per_day: true,
      tack_stall_per_day: true,
      drug_test: true,
    },
  },
  administration_fee: {
    select: {
      administration: true,
      late_inscription: true,
      cancel_inscription: true,
      ground: true,
      paramedics: true,
      camper_ground_rental: true,
    },
  },
  Shows_Packages: {
    select: {
      package: {
        select: {
          id: true,
          name: true,
          description: true,
          tack_stalls: true,
          stalls: true,
          hays: true,
          chiving: true,
          price: true,
        },
      },
    },
  },
  recognized_show: true,
  rules: true,
  start_date: true,
  end_date: true,
  inscription_start_date: true,
  inscription_end_date: true,
  inscription_end_late_date: true,
  show_aksed_code: {
    select: {
      asked_code_name: true,
    },
  },
};

/**
 * Fetches all the shows for a user that is not logged
 * @author Nathan Lessard
 *
 * @param {*} req
 * @return {Promise<*>} AllShows
 */
async function fetchAllNotLoggedShows(req) {
  const Page = req.query.page ?
    isNaN(req.query.page) || req.query.page < 1 ?
      1 :
      req.query.page :
    1;
  const Limit = req.query.limit ?
    isNaN(req.query.limit) ?
      10 :
      parseInt(req.query.limit) :
    10;

  const Where = await createWhere(req);

  const AllShows = await prisma.shows.findMany({
    skip: (Page - 1) * Limit,
    take: Limit,
    distinct: ['id'],
    where: Where,
    select: {
      id: true,
      name: true,
      start_date: true,
      end_date: true,
      nb_free_place: true,
      nb_free_permanent_stalls: true,
      nb_free_temp_stalls: true,
      nb_free_tack_stalls: true,
      path_logo: true,
      address: {
        select: {
          city: true,
          zip_code: true,
        },
      },
    },
    orderBy: {
      start_date: 'asc',
    },
  });

  const count = await countShow(Where);

  const AllShowsCount = await addCount({data: AllShows}, count, Page, Limit);
  return AllShowsCount;
}

/**
 * Fetches all the Shows or the queried ones
 * @param {*} req request parameters
 *
 * @return {Promise<*>} Shows
 */
async function fetchAllShows(req) {
  const Page = req.query.page ?
    isNaN(req.query.page) || req.query.page < 1 ?
      1 :
      req.query.page :
    1;
  const Limit = req.query.limit ?
    isNaN(req.query.limit) ?
      10 :
      parseInt(req.query.limit) :
    10;

  const Where = await createWhere(req);

  const count = await countShow(Where);

  const AllShows = await prisma.shows.findMany({
    skip: (Page - 1) * Limit,
    take: Limit,
    distinct: ['id'],
    where: Where,
    select: show,
    orderBy: {
      start_date: 'asc',
    },
  });

  if (AllShows === undefined || AllShows.length === 0) {
    return AllShows;
  }
  const AllShowsCount = await addCount({data: AllShows}, count, Page, Limit);

  return AllShowsCount;
}

/**
 * Fetches all the Shows that are not started
 * Used for middleware only.
 * @author API ALCHEMISTS
 *
 * @param {*} req
 * @return {Promise<*>} shows
 */
async function fetchAllNotEnded(req) {
  if (req.query.zip_code === undefined) {
    return {error: 'Zip code is required'};
  }
  const AllShows = await prisma.shows.findMany({
    distinct: ['id'],
    where: {
      AND: [
        {
          end_date: {
            gt: new Date(),
          },
          address: {
            zip_code: {
              equals: req.query.zip_code,
            },
          },
        },
      ],
    },
    select: {
      address: {
        select: {
          zip_code: true,
        },
        start_date: true,
        end_date: true,
      },
    },
    orderBy: {
      start_date: 'asc',
    },
  });
  return AllShows;
}

/**
 * Get show by id
 * @param {int} show_id show_id
 * @return {Promise<*>} show
 */
async function showById(show_id) {
  const _show = await prisma.shows.findUnique({
    where: {
      id: parseInt(show_id),
    },
    select: oneShow,
  });
  if (_show) {
    if (
      _show.show_aksed_code !== undefined &&
      Array.isArray(_show.show_aksed_code)
    ) {
      const askedCodesArray = _show.show_aksed_code.map(
          (codeObj) => codeObj.asked_code_name,
      );
      _show.asked_codes = askedCodesArray.join(', ');
      _show.asked_codes = [];
      askedCodesArray.forEach((askedCodeName) => {
        _show.asked_codes.push(askedCodeName);
      });
    }

    const verifEndDate =
      _show.inscription_end_late_date === null ?
        _show.inscription_end_date :
        _show.inscription_end_late_date;

    const currDate = new Date();

    _show.canRegister =
      currDate <= new Date(verifEndDate) &&
      currDate >= new Date(_show.inscription_start_date);
  }

  return _show;
}

/**
 * Check if the show is published
 * @param {int} show_id
 * @return {Promise<*>} show
 */
async function getShowIsPublised(show_id) {
  const _show = await prisma.shows.findUnique({
    where: {
      id: parseInt(show_id),
    },
    select: {
      is_published: true,
    },
  });
  return _show;
}

/**
 * Get the detail from a show for not logged user.
 * @param {int} show_id The id of the show.
 * @return {Promise<*>} Show details.
 */
async function showByIdNotLogged(show_id) {
  const show = await prisma.shows.findUnique({
    where: {
      id: show_id,
    },
    select: {
      id: true,
      name: true,
      start_date: true,
      end_date: true,
      nb_free_place: true,
      nb_free_permanent_stalls: true,
      nb_free_temp_stalls: true,
      nb_free_tack_stalls: true,
      address: {
        select: {
          city: true,
          zip_code: true,
        },
      },
    },
  });

  return show;
}

/**
 * Get secretary by show id
 * @param {int} show_id show_id
 * @return {Promise<*>} secretary id
 */
async function secretaryByShowId(show_id) {
  const _show = await prisma.shows.findUnique({
    where: {
      id: parseInt(show_id),
    },
    select: secretary,
  });

  return _show;
}

/**
 * Count the number of shows
 *
 * @param {*} Where
 * @return {*} the number of shows
 */
async function countShow(Where) {
  const count = await prisma.shows.count({
    where: Where,
  });
  return count;
}

/**
 *
 * @param {*} show
 * @param {Int} count
 * @param {Int} page
 * @param {Int} Limit
 *
 * @return {*} show
 */
async function addCount(show, count, page, Limit) {
  const paginate = {
    pagination: {
      total_records: count,
      current_page: page,
      total_pages: Math.ceil(count / Limit),
      next_page: page + 1 < Math.ceil(count / Limit) ? page + 1 : null,
      prev_page: page - 1 > 0 ? page - 1 : null,
    },
  };

  return Object.assign({}, show, paginate);
}

/**
 * Delete the show by its id
 *
 * @param {int} show_id
 * @return {Promise<*>} show
 */
async function deleteById(show_id) {
  const _show = await prisma.shows.delete({
    where: {
      id: parseInt(show_id),
    },
    select: show,
  });
  return _show;
}

/**
 * Create a show
 * @param {*} data data
 * @param {int} organizer_id user_id
 * @param {string} logoShowPath logoShowPath
 * @return {Promise<*>} show
 */
async function createShow(data, organizer_id, logoShowPath) {
  return prisma.$transaction(async (tx) => {
    const newShowFees = await tx.shows_Fees.create({
      data: {
        hay: parseInt(data.hay),
        chiving: parseInt(data.chiving),
        temp_stall_per_day: parseInt(data.temp_stall_per_day),
        permanent_stall_per_day: parseInt(data.permanent_stall_per_day),
        tack_stall_per_day: parseInt(data.tack_stall_per_day),
        drug_test: parseInt(data.drug_test),
      },
    });

    const newAdministrationFees = await tx.administration_Fees.create({
      data: {
        administration: parseInt(data.administration),
        late_inscription: parseInt(data.late_inscription),
        cancel_inscription: parseInt(data.cancel_inscription),
        ground: parseInt(data.ground),
        paramedics: parseInt(data.paramedics),
        camper_ground_rental: parseInt(data.camper_ground_rental),
      },
    });
    const _incription_end_late_date = data.inscription_end_late_date ?
      new Date(data.inscription_end_late_date) :
      null;

    const newShow = await tx.shows.create({
      data: {
        name: data.name,
        address_id: parseInt(data.address_id),
        organizer_id: parseInt(organizer_id),
        nb_total_place: parseInt(data.nb_total_place),
        nb_free_place: parseInt(data.nb_free_place),
        nb_temp_stalls: parseInt(data.nb_temp_stalls),
        nb_tack_stalls: parseInt(data.nb_tack_stalls),
        nb_free_temp_stalls: parseInt(data.nb_free_temp_stalls),
        nb_free_tack_stalls: parseInt(data.nb_free_tack_stalls),
        nb_free_permanent_stalls: parseInt(data.nb_free_permanent_stalls),
        nb_permanent_stalls: parseInt(data.nb_permanent_stalls),
        recognized_show: data.recognized_show.toLowerCase() === 'true',
        rules: data.rules,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        inscription_end_date: new Date(data.inscription_end_date),
        inscription_end_late_date: _incription_end_late_date,
        inscription_start_date: new Date(data.inscription_start_date),
        secretary_id: parseInt(organizer_id),
        path_logo: logoShowPath,
        is_published: false,
        is_vaccination_proof_required:
          data.is_vaccination_proof_required.toLowerCase() === 'true',
        is_coggins_proof_required:
          data.is_coggins_proof_required.toLowerCase() === 'true',
        show_fee_id: newShowFees.id,
        administration_fee_id: newAdministrationFees.id,
      },
    });

    if (data.asked_codes !== undefined && data.asked_codes !== '') {
      const asked_codes_array = data.asked_codes
          .split(',')
          .filter((code) => code.trim() !== '');

      for (i = 0; i < asked_codes_array.length; i++) {
        await tx.shows_Asked_Codes.create({
          data: {
            show_id: newShow.id,
            asked_code_name: asked_codes_array[i],
          },
        });
      }
    }
    return newShow;
  });
}

/**
 * Fetches all the shows of the user
 * @author API ALCHEMISTS
 *
 * @param {*} userId
 * @param {string} role
 * @return {Promise<*>} shows
 */
async function fetchAdminShows(userId, role) {
  let Where = null;
  if (role === 'ORGANIZER') {
    Where = {
      organizer: {
        id: userId,
      },
    };
  } else if (role === 'SECRETARY') {
    Where = {
      secretary_id: userId,
    };
  } else {
    Where = {};
  }
  const allShows = await prisma.shows.findMany({
    where: Where,
    select: show,
  });
  return allShows;
}

/**
 * Get show by its id for admin
 * @author Nathan Lessard
 *
 * @param {*} showId
 * @return {Promise<*>} show
 */
async function showAdminById(showId) {
  const _show = await prisma.shows.findUnique({
    where: {
      id: parseInt(showId),
    },
    select: adminShow,
  });
  return _show;
}

/** Remove show available stalls when there is an inscription
 *
 * @param {int} showId
 * @param {int} nb_stalls
 * @param {int} nb_tack_stalls
 * @param {Array} bundles
 *
 * @return {object} type of stall
 */
async function removeShowAvailableStalls(
    showId,
    nb_stalls,
    nb_tack_stalls,
    bundles,
) {
  try {
    const show = await prisma.shows.findUnique({
      where: {
        id: showId,
      },
    });
    let amountStalls = nb_stalls;
    let amountTackStalls = nb_tack_stalls;
    for (const packages of bundles) {
      const bundle = await prisma.packages.findFirst({
        where: {
          id: packages.id,
        },
      });
      amountStalls += bundle.stalls * packages.count;
      amountTackStalls += bundle.tack_stalls * packages.count;
    }

    const stallTypes = {
      permanent: 'nb_free_permanent_stalls',
      temp: 'nb_free_temp_stalls',
    };

    let type = {};

    // Check if there is enough space for the amount asked and remove it in bd
    for (const [stallType, stallBD] of Object.entries(stallTypes)) {
      if (show[stallBD] >= amountStalls) {
        type = {
          [stallType]: nb_stalls,
        };
        await prisma.shows.update({
          where: {
            id: showId,
          },
          data: {
            [stallBD]: show[stallBD] - amountStalls,
          },
        });
        break;
      }
    }
    if (
      Object.keys(type).length !== 0 &&
      show.nb_free_tack_stalls >= amountTackStalls
    ) {
      type = {
        ...type,
        tack: nb_tack_stalls,
      };
      await prisma.shows.update({
        where: {
          id: showId,
        },
        data: {
          nb_free_tack_stalls: show.nb_free_tack_stalls - amountTackStalls,
        },
      });
    }
    return type;
  } catch (error) {
    return {error: error};
  }
}

/**
 * Create the where object for the query
 * @author Nathan Lessard
 *
 * @param {*} req
 * @return {Promise<*>} where
 */
async function createWhere(req) {
  let stateAsked = {};

  const state = req.query.show_state;
  if (state === 'pre-show') {
    stateAsked = {
      start_date: {
        gt: new Date(),
      },
    };
  } else if (state === 'show') {
    stateAsked = {
      AND: [
        {
          start_date: {
            lte: new Date(),
          },
          end_date: {
            gte: new Date(),
          },
        },
      ],
    };
  } else if (state === 'post-show') {
    stateAsked = {
      end_date: {
        lt: new Date(),
      },
    };
  } else {
    stateAsked = {};
  }

  let Where = {};
  if (req.query.query == undefined) {
    req.query.query = '';
  }
  if (req.query.query.match(/^\d{4}-\d{2}-\d{2}$/)) {
    Where = Object.assign({}, Where, {
      start_date: {
        gte: new Date(req.query.query),
      },
    });
  } else {
    Where = Object.assign({}, Where, {
      AND: [
        {
          OR: [
            {
              name: {
                contains: req.query.query,
              },
            },
            {
              organizer: {
                name: {
                  contains: req.query.query,
                },
              },
            },
            {
              address: {
                city: {
                  equals: req.query.query,
                },
              },
            },
          ],
        },
        stateAsked,
        {
          is_published: true,
        },
      ],
    });
  }

  return Where;
}

/**
 * Update show by its id
 * @author Nathan Lessard & YongJian Qiu
 *
 * @param {json} data Data from the form
 * @param {int} showId showId
 * @param {string} logoShowPath logoShowPath
 * @return {Promise<*>} show
 */
async function updateShow(data, showId, logoShowPath) {
  const show = await prisma.shows.findUnique({
    where: {
      id: showId,
    },
  });
  const nb_free_place =
    data.nb_total_place - (show.nb_total_place - show.nb_free_place);

  const nb_free_temp_stalls =
    data.nb_temp_stalls - (show.nb_temp_stalls - show.nb_free_temp_stalls);

  const nb_free_tack_stalls =
    data.nb_tack_stalls - (show.nb_tack_stalls - show.nb_free_tack_stalls);

  const nb_free_permanent_stalls =
    data.nb_permanent_stalls -
    (show.nb_permanent_stalls - show.nb_free_permanent_stalls);

  return prisma.$transaction(async (tx) => {
    await tx.shows_Fees.update({
      where: {
        id: show.show_fee_id,
      },
      data: {
        hay: parseInt(data.hay),
        chiving: parseInt(data.chiving),
        temp_stall_per_day: parseInt(data.temp_stall_per_day),
        permanent_stall_per_day: parseInt(data.permanent_stall_per_day),
        tack_stall_per_day: parseInt(data.tack_stall_per_day),
        drug_test: parseInt(data.drug_test),
      },
    });

    await tx.administration_Fees.update({
      where: {
        id: show.administration_fee_id,
      },
      data: {
        administration: parseInt(data.administration),
        late_inscription: parseInt(data.late_inscription),
        cancel_inscription: parseInt(data.cancel_inscription),
        ground: parseInt(data.ground),
        paramedics: parseInt(data.paramedics),
        camper_ground_rental: parseInt(data.camper_ground_rental),
      },
    });
    const _incription_end_late_date = data.inscription_end_late_date ?
      new Date(data.inscription_end_late_date) :
      null;

    const newShow = await tx.shows.update({
      where: {
        id: showId,
      },
      data: {
        name: data.name,
        address_id: parseInt(data.address_id),
        nb_total_place: parseInt(data.nb_total_place),
        nb_temp_stalls: parseInt(data.nb_temp_stalls),
        nb_tack_stalls: parseInt(data.nb_tack_stalls),
        nb_permanent_stalls: parseInt(data.nb_permanent_stalls),
        nb_free_place: parseInt(nb_free_place),
        nb_free_tack_stalls: parseInt(nb_free_tack_stalls),
        nb_free_permanent_stalls: parseInt(nb_free_permanent_stalls),
        nb_free_temp_stalls: parseInt(nb_free_temp_stalls),
        recognized_show: data.recognized_show.toLowerCase() === 'true',
        rules: data.rules,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        inscription_end_date: new Date(data.inscription_end_date),
        inscription_end_late_date: _incription_end_late_date,
        inscription_start_date: new Date(data.inscription_start_date),
        path_logo: logoShowPath,
        is_vaccination_proof_required:
          data.is_vaccination_proof_required.toLowerCase() === 'true',
        is_coggins_proof_required:
          data.is_coggins_proof_required.toLowerCase() === 'true',
      },
    });
    await tx.shows_Asked_Codes.deleteMany({
      where: {
        show_id: showId,
      },
    });
    if (data.asked_codes !== undefined && data.asked_codes !== '') {
      const asked_codes_array = data.asked_codes
          .split(',')
          .map((code) => code.trim())
          .filter((code) => code.trim() !== '');

      for (i = 0; i < asked_codes_array.length; i++) {
        await tx.shows_Asked_Codes.create({
          data: {
            show_id: newShow.id,
            asked_code_name: asked_codes_array[i],
          },
        });
      }
    }
    return newShow;
  });
}

/**
 * Obtenir tout les informations contenu dans la table d'un show
 * @param {int} show_id le id du show
 * @return {Promise<*>} show
 */
async function showByIdAllData(show_id) {
  const _show = await prisma.shows.findUnique({
    where: {
      id: parseInt(show_id),
    },
  });
  return _show;
}

/**
 * Publishes a show
 * @author Nathan Lessard
 *
 * @param {*} req
 * @param {Int} showId
 * @return {Promise<string>} show
 */
async function publishShowById(req, showId) {
  const updateShow = await prisma.shows.update({
    where: {
      id: parseInt(showId),
    },
    data: {
      is_published: req.body.is_published,
    },
  });
  if (updateShow) {
    return req.body.is_published ?
      'Show was published' :
      'Show was unpublished';
  }
  throw new Error('Show not found');
}

/** Update show by its id if it is published
 * @author YongJian Qiu
 *
 * @param {json} data Data from the form
 * @param {int} showId showId
 * @param {string} logoShowPath logoShowPath
 * @return {Promise<*>} show
 */
async function updateShowPublished(data, showId) {
  const show = await prisma.shows.findUnique({
    where: {
      id: showId,
    },
  });
  const nb_free_place =
    data.nb_total_place - (show.nb_total_place - show.nb_free_place);

  const nb_free_temp_stalls =
    data.nb_temp_stalls - (show.nb_temp_stalls - show.nb_free_temp_stalls);

  const nb_free_tack_stalls =
    data.nb_tack_stalls - (show.nb_tack_stalls - show.nb_free_tack_stalls);

  const nb_free_permanent_stalls =
    data.nb_permanent_stalls -
    (show.nb_permanent_stalls - show.nb_free_permanent_stalls);

  return prisma.$transaction(async (tx) => {
    const newShow = await tx.shows.update({
      where: {
        id: showId,
      },
      data: {
        nb_total_place: parseInt(data.nb_total_place),
        nb_temp_stalls: parseInt(data.nb_temp_stalls),
        nb_tack_stalls: parseInt(data.nb_tack_stalls),
        nb_permanent_stalls: parseInt(data.nb_permanent_stalls),
        nb_free_place: parseInt(nb_free_place),
        nb_free_tack_stalls: parseInt(nb_free_tack_stalls),
        nb_free_permanent_stalls: parseInt(nb_free_permanent_stalls),
        nb_free_temp_stalls: parseInt(nb_free_temp_stalls),
        rules: data.rules,
      },
    });
    return newShow;
  });
}

/**
 * Get show asked code
 * @param {*} show_id show_id
 * @return {Promise<*>} show asked codes
 */
async function getShowAskedCodes(show_id) {
  return await prisma.shows_Asked_Codes.findMany({
    where: {
      show_id: show_id,
    },
  });
}

/**
 * get all inscriptions for a show
 * @param {int} show_id show_id
 * @param {string} has_payed (needs to be converted to boolean)
 * @return {Promise<*>} show inscriptions
 */
async function showInscriptions(show_id, has_payed) {
  const whereCondition = {
    show_id: show_id,
  };

  if (
    has_payed !== undefined &&
    (has_payed === 'true' || has_payed === 'false')
  ) {
    whereCondition.has_payed = has_payed === 'true';
  }

  return await prisma.inscriptions.findMany({
    where: whereCondition,
    include: {
      Classes_Inscriptions: {
        select: {
          class_id: true,
          class: {
            select: {
              name: true,
            },
          },
        },
      },
      Inscriptions_Asked_Codes: {
        select: {
          code_name: true,
          code_value: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
      rider: {
        select: {
          name: true,
        },
      },
      horse: {
        select: {
          name: true,
        },
      },
    },
  });
}

/**
 * Remove the organizer's shows remaining places
 * @param {*} user user
 * @return {Promise<*>} shows
 */
async function removeOrganizerShowRemaining(user) {
  if (user.role === 'ADMIN') {
    return;
  }

  return await prisma.organizerShows.update({
    where: {
      user_id: user.id,
    },
    data: {
      remaining_shows: {
        decrement: 1,
      },
    },
  });
}

/**
 * Gets all show by its user id
 * @param {int} userId userId
 * @return {Promise<*>}
 */
async function showByUserId(userId) {
  return await prisma.shows.findMany({
    where: {
      secretary_id: userId,
    },
  });
}

/**
 * Changes the secretary to organizer
 *
 * @param {int} showId showId
 * @param {int} organizerId organizerId
 * @return {Promise<*>}
 */
async function removeSecretaryFromShow(showId, organizerId) {
  return await prisma.shows.update({
    where: {
      id: showId,
    },
    data: {
      secretary_id: organizerId,
    },
  });
}

module.exports = {
  showById,
  showByIdNotLogged,
  fetchAllNotLoggedShows,
  fetchAllShows,
  fetchAllNotEnded,
  fetchAdminShows,
  showAdminById,
  deleteById,
  createShow,
  removeShowAvailableStalls,
  updateShow,
  secretaryByShowId,
  publishShowById,
  updateShowPublished,
  showByIdAllData,
  getShowAskedCodes,
  showInscriptions,
  removeOrganizerShowRemaining,
  showByUserId,
  removeSecretaryFromShow,
  getShowIsPublised,
};
