const {
  addInscription,
  updateInscriptionApproval,
  getShowFeeFromShowId,
  getAdminFeeFromShowId,
  isInscriptionLate,
  getInscriptionsByUserId,
  getInscriptionById,
  getDetailed,
} = require('../services/inscriptions.service');
const {
  removeShowAvailableStalls,
  getShowAskedCodes,
} = require('../services/shows.service');
const {showById} = require('../services/shows.service.js');
const {getAddressJustById} = require('../services/addresses.service');
const {getHorseById} = require('../services/horses.service.js');
const {getRiderById} = require('../services/riders.service.js');
const {getBundleFeeFromBundleId} = require('../services/bundles.service.js');
const {getClassById} = require('../services/classes.service.js');
const prisma = require('../../prisma/client.js');
const {getUserById} = require('../services/users.service.js');

/**
 * POST /inscriptions
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} inscription
 */
async function postInscription(req, res) {
  try {
    const user_id = req.user.id;
    const show_id = parseInt(req.params.showId);
    const class_id = parseInt(req.params.classId);
    const bundle = req.body.Shows_Packages ?? [];

    // Validation of the asked codes
    const asked_codes_in_body = req.body.show_asked_codes;
    const askedCodes = await getShowAskedCodes(show_id);

    // missing codes if askedCodes is null
    if (asked_codes_in_body === null && askedCodes.length > 0) {
      return res.status(400).json({
        message:
          'Missing codes: ' +
          askedCodes.map((code) => code.asked_code_name).join(', '),
      });
    }

    if (asked_codes_in_body !== null && askedCodes !== null) {
      const askedCodeNames = askedCodes.map((code) => code.asked_code_name);

      // missing codes if askedCodes is not null
      const missingCodes = askedCodeNames.filter(
          (code) => !(code in asked_codes_in_body),
      );
      if (missingCodes.length > 0) {
        return res.status(400).json({
          message: `Missing codes: ${missingCodes.join(', ')}`,
        });
      }

      // extra codes
      const extraCodes = Object.keys(asked_codes_in_body).filter(
          (code) => !askedCodeNames.includes(code),
      );
      if (extraCodes.length > 0) {
        return res.status(400).json({
          message: `Extra codes: ${extraCodes.join(', ')}`,
        });
      }

      // null codes
      const emptyValues = Object.entries(asked_codes_in_body).filter(
          ([, value]) => value === null || value.trim() === '',
      );
      if (emptyValues.length > 0) {
        return res.status(400).json({
          message:
            'Empty values: ' + emptyValues.map(([code]) => code).join(', '),
        });
      }
    }

    // Validation of the number of stalls
    const nb_stalls = req.body.nb_stalls;
    const nb_tack_stalls = req.body.nb_tack_stalls;

    const type = await removeShowAvailableStalls(
        show_id,
        nb_stalls,
        nb_tack_stalls,
        bundle,
    );

    if (Object.keys(type).length === 0) {
      return res.status(400).json({error: 'No enough stalls available'});
    }
    const stall_type = Object.keys(type)[0];

    // Calculate the bill
    const show_fee = await getShowFeeFromShowId(show_id);
    const admin_fee = await getAdminFeeFromShowId(show_id);
    const late = await isInscriptionLate(show_id);
    const total = await calculateTotal(
        show_fee,
        admin_fee,
        req.body,
        type,
        late,
        bundle,
    );

    const result = await addInscription(
        req.body,
        user_id,
        show_id,
        class_id,
        asked_codes_in_body,
        stall_type,
        bundle,
        total,
    );

    result.class_id = class_id;
    result.total = total;

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * PATCH /shows/:showId/classes/:classId/inscriptions/:inscriptionId
 * Modifier l'approbation d'une inscription
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} inscription
 */
async function patchInscription(req, res) {
  try {
    const inscription_id = parseInt(req.params.inscriptionId);
    const approved = req.body.approved;

    const result = await updateInscriptionApproval(inscription_id, approved);

    result.class_id = parseInt(req.params.classId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * GET /inscriptions/:inscriptionId/receipt
 * Gets a detailed receipt for an inscription
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} inscription
 */
async function getDetailedReceipt(req, res) {
  try {
    const detailedRecipt = await generateDetailedReceipt(
        parseInt(req.params.inscriptionId),
    );

    res.status(200).json(detailedRecipt);
  } catch (error) {
    res.status(201).json({error: 'There was an error with your request'});
  }
}

/**
 * Generate detailed receipt
 *
 * @param {int} inscriptionId
 * @return {Promise<*>} detailedRecipt
 */
async function generateDetailedReceipt(inscriptionId) {
  const inscription = await getDetailed(inscriptionId);
  let isLateInscription = false;
  if (
    inscription.inscription_end_late_date !== null ||
    inscription.inscription_end_late_date !== undefined
  ) {
    isLateInscription =
      inscription.inscription_end_date <
      inscription.inscriptioncreatedAt <
      inscription.inscription_end_late_date;
  }
  let bundleTotalPrice = 0;
  let stallFees = 0;
  if (inscription.stall_type === 'PERMANENT') {
    stallFees = inscription.show.show_fees.permanent_stall_per_day;
  } else {
    stallFees = inscription.show.show_fees.temp_stall_per_day;
  }
  const bundles = [];
  for (const bundle of inscription.Inscriptions_Packages) {
    bundleTotalPrice += bundle.nb_packages * bundle.package.price;
    bundles.push({
      description: bundle.package.name,
      quantity: bundle.nb_packages,
      rate: bundle.package.price / 100,
      extension: (bundle.nb_packages * bundle.package.price) / 100,
    });
  }

  const totalOtherFees =
    inscription.show.administration_fee.administration +
    inscription.show.administration_fee.camper_ground_rental +
    inscription.show.administration_fee.ground +
    inscription.show.show_fees.drug_test +
    inscription.show.show_fees.hay * inscription.nb_hay_bale +
    inscription.show.show_fees.chiving * inscription.nb_chiving_bags +
    stallFees * inscription.nb_stalls * inscription.nb_days +
    inscription.show.show_fees.tack_stall_per_day *
      inscription.nb_tack_stalls *
      inscription.nb_days;

  const detailedRecipt = {
    informations: {
      competition_name: inscription.show.name,
      competition_adress:
        inscription.show.address.street_address +
        ' ' +
        inscription.show.address.city +
        ' ' +
        inscription.show.address.province +
        ' ' +
        inscription.show.address.zip_code,
      competition_date: inscription.show.start_date,
      secretary_name: inscription.show.secretary.name,
      secretary_email: inscription.show.secretary.email,
      secretary_phone: inscription.show.secretary.phone,
    },
    entries: [
      {
        entry_number: inscription.rider_entry_number,
        rider_name: inscription.rider.name,
        horse_name: inscription.horse.name,
        entry_fees: [
          {
            class_number: inscription.Classes_Inscriptions.class.id,
            class_name: inscription.Classes_Inscriptions.class.name,
            test: inscription.Classes_Inscriptions.class.test.name,
          },
        ],
        stall_fees: bundles,
        total_stable_fees: bundleTotalPrice / 100,
        other_fees: [
          {
            description: 'late inscription',
            quantity: isLateInscription ? 1 : 0,
            rate: inscription.show.administration_fee.late_inscription / 100,
            extension: isLateInscription ?
              inscription.show.administration_fee.late_inscription / 100 :
              0,
          },
          {
            description: 'administration fees',
            quantity: 1,
            rate: inscription.show.administration_fee.administration / 100,
            extension: inscription.show.administration_fee.administration / 100,
          },
          {
            description: 'ground fees',
            quantity: 1,
            rate: inscription.show.administration_fee.ground / 100,
            extension: inscription.show.administration_fee.ground / 100,
          },
          {
            description: 'camper ground rental fees',
            quantity: 1,
            rate:
              inscription.show.administration_fee.camper_ground_rental / 100,
            extension:
              inscription.show.administration_fee.camper_ground_rental / 100,
          },
          {
            description: 'drug test',
            quantity: 1,
            rate: inscription.show.show_fees.drug_test / 100,
            extension: inscription.show.show_fees.drug_test / 100,
          },
          {
            description: 'hay bale',
            quantity: inscription.nb_hay_bale,
            rate: inscription.show.show_fees.hay / 100,
            extension:
              (inscription.show.show_fees.hay * inscription.nb_hay_bale) / 100,
          },
          {
            description: 'chiving bags',
            quantity: inscription.nb_chiving_bags,
            rate: inscription.show.show_fees.chiving / 100,
            extension:
              (inscription.show.show_fees.chiving *
                inscription.nb_chiving_bags) /
              100,
          },
          {
            description:
              inscription.stall_type.toLowerCase() +
              ' stall - ' +
              inscription.nb_days +
              'days',
            quantity: inscription.nb_stalls,
            rate: stallFees / 100,
            extension:
              (stallFees * inscription.nb_stalls * inscription.nb_days) / 100,
          },
          {
            description: 'tack stall - ' + inscription.nb_days + 'days',
            quantity: inscription.nb_tack_stalls,
            rate: inscription.show.show_fees.tack_stall_per_day / 100,
            extension:
              (inscription.show.show_fees.tack_stall_per_day *
                inscription.nb_tack_stalls *
                inscription.nb_days) /
              100,
          },
        ],
        total_other_fees: totalOtherFees / 100,
      },
    ],
    total_fees: inscription.total / 100,
    payment_total: inscription.has_payed ? 0 : inscription.total / 100,
  };
  return detailedRecipt;
}

/**
 * Calculate total
 * @param {Prisma.show_fee} show_fee
 * @param {Prisma.administration_fee} admin_fee
 * @param {object} body
 * @param {object} type
 * @param {boolean} late if the inscription is in the late period
 * @param {Array} bundle
 * @return {Promise<number>} total
 */
async function calculateTotal(show_fee, admin_fee, body, type, late, bundle) {
  const total_show = calculateShowTotal(show_fee, body, type);

  const total_admin = calculateAdminTotal(admin_fee, late);
  const total_bundle = await calculateTotalBundle(bundle);
  return total_show + total_admin + total_bundle;
}

/**
 * Calculate total bundle
 * @param {Array} bundle
 * @return {Promise<number>} total amount for bundles
 */
async function calculateTotalBundle(bundle) {
  let bundleTotal = 0;
  for (const bundleElement of bundle) {
    const bundle_fee = await getBundleFeeFromBundleId(bundleElement.id);
    bundleTotal += bundleElement.count * bundle_fee.price;
  }
  return bundleTotal;
}

/**
 * Calculate show total
 * @param {Prisma.show_fee} show_fee
 * @param {object} body
 * @param {object} type
 * @return {number} total
 */
function calculateShowTotal(show_fee, body, type) {
  let total = 0;
  const {nb_hay_bale, nb_chiving_bags} = body;

  const type_association = {
    permanent: show_fee.permanent_stall_per_day,
    temp: show_fee.temp_stall_per_day,
    tack: show_fee.tack_stall_per_day,
  };

  const hay_bale = show_fee.hay * nb_hay_bale;
  const chiving_bags = show_fee.chiving * nb_chiving_bags;
  const stall =
    type_association[Object.keys(type)[0]] *
    Object.values(type)[0] *
    body.nb_days;
  const tack = type_association.tack * body.nb_tack_stalls * body.nb_days;
  total = hay_bale + chiving_bags + stall + show_fee.drug_test + tack;

  return total;
}

/**
 * Calculate admin total
 * @param {Prisma.administration_fee} admin_fee
 * @param {boolean} late
 * @return {number} total
 */
function calculateAdminTotal(admin_fee, late) {
  const {
    administration,
    late_inscription,
    ground,
    paramedics,
    camper_ground_rental,
  } = admin_fee;
  let total = 0;

  const late_fee = late ? late_inscription : 0;

  total =
    administration + late_fee + ground + paramedics + camper_ground_rental;

  return total;
}

/**
 * GET /inscriptions
 * @param {*} req
 * @param {*} res
 * @return {Promise<*>} inscriptions
 */
async function getInscriptions(req, res) {
  try {
    const user_id = parseInt(req.params.userId);
    const inscriptions = await getInscriptionsByUserId(user_id);

    if (
      inscriptions === null ||
      inscriptions === undefined ||
      Object.keys(inscriptions).length < 1
    ) {
      return res.status(204).json();
    }
    const inscriptions_refactors = [];
    await Promise.all(
        inscriptions.map(async (inscription) => {
          const show = await showById(inscription.show_id);
          const address = await getAddressJustById(show.address.id);
          const horse = await getHorseById(inscription.horse_id);
          const rider = await getRiderById(inscription.rider_id);

          const Classes_Inscriptions =
          await prisma.classes_Inscriptions.findFirst({
            where: {
              inscription_id: inscription.id,
            },
          });
          const classe = await getClassById(Classes_Inscriptions.class_id);

          const _inscription = {
            id: inscription.id,
            invoice_number: inscription.invoice_number,
            show: {
              id: show.id,
              name: show.name,
              start_date: show.start_date,
              city: address.city,
              zip_code: address.zip_code,
            },
            has_payed: inscription.has_payed,
            rider_entry_number: inscription.rider_entry_number,
            class_name: classe.name,
            horse_name: horse.name,
            rider_name: rider.name,
            show_asked_codes: inscription.Inscriptions_Asked_Codes,
          };
          inscriptions_refactors.push(_inscription);
        }),
    );

    return res.status(200).json({inscriptions: inscriptions_refactors});
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
}

/**
 * GET /inscriptions/:inscriptionId
 * @param {*} req request
 * @param {*} res response
 * @return {Promise<*>} inscription
 */
async function getInscription(req, res) {
  try {
    const inscription_id = parseInt(req.params.inscriptionId);
    const inscription = await getInscriptionById(inscription_id);
    if (inscription === null || inscription === undefined) {
      return res.status(204).json();
    }
    if (req.user.role === 'USER' && req.user.id !== inscription.user_id) {
      return res.status(403).json({message: 'Forbidden'});
    }

    const show = await showById(inscription.show_id);
    if (show === null || show === undefined) {
      return res.status(204).json();
    }
    if (req.user.role === 'ORGANIZER' && req.user.id !== show.organizer.id) {
      return res.status(403).json({message: 'Forbidden'});
    }
    if (req.user.role === 'SECRETARY' && req.user.id !== show.secretary_id) {
      return res.status(403).json({message: 'Forbidden'});
    }

    const address = await getAddressJustById(show.address.id);
    const horse = await getHorseById(inscription.horse_id);
    const rider = await getRiderById(inscription.rider_id);
    const _user = await getUserById(inscription.user_id);

    const Classes_Inscriptions = await prisma.classes_Inscriptions.findFirst({
      where: {
        inscription_id: inscription.id,
      },
    });
    const classe = await getClassById(Classes_Inscriptions.class_id);

    const path_vaccine = horse.path_vaccine === null ? null :
      horse.path_vaccine.substring(horse.path_vaccine.lastIndexOf('/') + 1);
    const path_coggins = horse.path_coggins === null ? null :
      horse.path_coggins.substring(horse.path_coggins.lastIndexOf('/') + 1);

    inscription.show = {
      id: show.id,
      name: show.name,
      start_date: show.start_date,
      city: address.city,
      zip_code: address.zip_code,
    };

    inscription.horse_name = horse.name;
    inscription.path_vaccine = path_vaccine;
    inscription.path_coggins = path_coggins;
    inscription.rider_name = rider.name;
    inscription.show_asked_codes = inscription.Inscriptions_Asked_Codes;
    inscription.class_name = classe.name;
    inscription.user_name = _user.name;

    return res.status(200).json(inscription);
  } catch (error) {
    return res.status(500).json({message: 'Internal server error'});
  }
}

module.exports = {
  postInscription,
  patchInscription,
  getInscriptions,
  getInscription,
  getDetailedReceipt,
  generateDetailedReceipt,
};
