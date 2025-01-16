const prisma = require('../../prisma/client');

/**
 * Add an inscription
 * @param {*} data data
 * @param {int} user_id user_id
 * @param {int} show_id show_id
 * @param {int} class_id class_id
 * @param {*} asked_codes_in_body asked_codes_in_body
 * @param {string} stall_type stall_type
 * @param {Array} bundle bundle
 * @param {int} total total
 * @return {Promise<*>} new inscription
 */
async function addInscription(
    data,
    user_id,
    show_id,
    class_id,
    asked_codes_in_body,
    stall_type,
    bundle,
    total,
) {
  const {
    horse_id,
    rider_id,
    no_fei,
    nb_stalls,
    nb_tack_stalls,
    nb_hay_bale,
    nb_chiving_bags,
    nb_days,
  } = data;

  const dicType = {
    permanent: 'PERMANENT',
    temp: 'TEMPORARY',
  };


  return prisma.$transaction(async (tx) => {
    const CountRidersInscriptions = await tx.inscriptions.count({
      where: {
        show_id: show_id,
      },
    });
    const nbRiders = CountRidersInscriptions + 1;


    const inscription = await tx.inscriptions.create({
      data: {
        user_id,
        show_id,
        horse_id,
        rider_id,
        no_fei,
        nb_stalls,
        nb_tack_stalls,
        nb_hay_bale,
        nb_chiving_bags,
        rider_entry_number: parseInt(nbRiders),
        stall_type: dicType[stall_type],
        nb_days: nb_days,
        total: total,
      },
    });

    await tx.classes_Inscriptions.create({
      data: {
        class_id,
        inscription_id: inscription.id,
      },
    });

    if (asked_codes_in_body !== null) {
      const createInscriptionCodes = [];
      for (const [codeName, codeValue] of Object.entries(asked_codes_in_body)) {
        createInscriptionCodes.push(
            tx.inscriptions_Asked_Codes.create({
              data: {
                inscription_id: inscription.id,
                code_name: codeName,
                code_value: codeValue,
              },
            }),
        );
      }
      await Promise.all(createInscriptionCodes);
    }
    for (const bundleElement of bundle) {
      await tx.inscriptions_Packages.create({
        data: {
          inscription_id: inscription.id,
          package_id: bundleElement.id,
          nb_packages: bundleElement.count,
        },
      });
    }
    return inscription;
  });
}

/**
 * Check if inscription is late
 * @param {int} show_id show_id
 * @return {Promise<*>} true if late
 */
async function isInscriptionLate(show_id) {
  const show = await prisma.shows.findUnique({
    where: {
      id: show_id,
    },
  });

  const today = new Date();
  const inscription_date = new Date(show.inscription_end_date);
  const inscription_late_date = new Date(show.inscription_end_late_date);

  return today > inscription_date && today < inscription_late_date;
}

/**
 * Update inscription approval
 * @param {int} inscription_id inscription_id
 * @param {boolean} _approved approved
 * @return {Promise<*>} updated inscription
 */
async function updateInscriptionApproval(inscription_id, _approved) {
  const inscription = await prisma.inscriptions.update({
    where: {
      id: inscription_id,
    },
    data: {
      approved: _approved,
    },
  });

  return inscription;
}

/**
 * Get show fee from show_id
 * @param {int} show_id show_id
 * @return {Promise<*>} show fee
 */
async function getShowFeeFromShowId(show_id) {
  const fee_id = await prisma.shows.findUnique({
    where: {
      id: show_id,
    },
    select: {
      show_fee_id: true,
    },
  });

  const fee = await prisma.shows_Fees.findUnique({
    where: {
      id: fee_id.show_fee_id,
    },
  });

  return fee;
}

/**
 * Get admin fee from show_id
 * @param {int} show_id show_id
 * @return {Promise<*>} admin fee
 */
async function getAdminFeeFromShowId(show_id) {
  const fee_id = await prisma.shows.findUnique({
    where: {
      id: show_id,
    },
    select: {
      administration_fee_id: true,
    },
  });

  const fee = await prisma.administration_Fees.findUnique({
    where: {
      id: fee_id.administration_fee_id,
    },
  });

  return fee;
}

/**
 * Get inscriptions by user_id
 * @param {int} user_id user_id
 * @return {Promise<*>} inscriptions
 */
async function getInscriptionsByUserId(user_id) {
  const inscriptions = await prisma.inscriptions.findMany({
    where: {
      user_id: user_id,
    },
  });
  return inscriptions;
}

/**
 * Get inscription by id
 * @param {*} inscriptionId inscriptionId
 * @return {Promise<*>} inscription
 */
async function getInscriptionById(inscriptionId) {
  const inscription = await prisma.inscriptions.findUnique({
    where: {
      id: inscriptionId,
    },
    include: {
      Inscriptions_Asked_Codes: true,
    },
  });
  return inscription;
}


/**
 * Get detailed inscriptions by inscription_id
 * includes rider name, horse name, show details, class details, package details
 * address details, administration_fee details, show_fees details,
 * secretary details, test details
 * @param {int} inscription_id inscription_id
 * @return {Promise<*>} inscriptions
 */
async function getDetailed(inscription_id) {
  try {
    const inscriptionDetails = await prisma.inscriptions.findUnique({
      where: {
        id: inscription_id,
      },
      include: {
        rider: {select: {name: true}},
        horse: {select: {name: true}},
        show: {
          include: {
            address: true,
            administration_fee: true,
            show_fees: true,
            secretary: true,
          },
        },
        Classes_Inscriptions: {
          include: {
            class: {
              include: {
                test: true,
              },
            },
          },
        },
        Inscriptions_Packages: {
          include: {
            package: true,
          },
        },
      },
    });
    return inscriptionDetails;
  } catch (error) {
  }
}


module.exports = {
  addInscription,
  updateInscriptionApproval,
  getShowFeeFromShowId,
  getAdminFeeFromShowId,
  isInscriptionLate,
  getInscriptionsByUserId,
  getInscriptionById,
  getDetailed,
};
