const prisma = require('../../prisma/client');

/**
 * Add a bundle
 * @param {json} data Data from the form
 * @param {int} show_id show_id
 * @return {Promise} Db response
 */
async function addBundle(data, show_id) {
  const {
    description,
    price,
    chiving,
    hays,
    name,
    stalls,
    tack_stalls,
  } = data;

  const newBundle = await prisma.packages.create({
    data: {
      description,
      price: parseInt(price),
      chiving: parseInt(chiving),
      hays: parseInt(hays),
      name: name,
      stalls: parseInt(stalls),
      tack_stalls: parseInt(tack_stalls),
    },
  });
  await linkBundleToShow(show_id, newBundle.id);

  return newBundle;
}

/**
 * get bundles by show Id
 * @param {int} show_id show_id
 * @return {Promise} Db response
 */
async function getBundlesByShowId(show_id) {
  const bundles = await prisma.shows_Packages.findMany({
    where: {
      show_id: show_id,
    },
  });
  const _bundles = await Promise.all(bundles.map(async (e) => {
    const _bundle = await prisma.packages.findUnique({
      where: {
        id: e.package_id,
      },
    });
    return _bundle;
  }));

  return _bundles;
}

/**
 * link a bundle to a show
 *
 * @param {*} show_id show_id
 * @param {*} bundle_id bundle_id
 */
async function linkBundleToShow(show_id, bundle_id) {
  await prisma.shows_Packages.create({
    data: {
      show_id: show_id,
      package_id: bundle_id,
    },
  });
}

/**
 * get a show package by its bundle id and show id
 *
 * @param {*} show_id show_id
 * @param {*} bundle_id bundle_id
 */
async function verifyShowLinkedPackage(show_id, bundle_id) {
  return await prisma.shows_Packages.findFirst({
    where: {
      show_id: show_id,
      package_id: bundle_id,
    },
  });
}

/**
 * get the fee of a bundle by its bundle id
 *
 * @param {*} bundle_id bundle_id
 */
async function getBundleFeeFromBundleId( bundle_id) {
  return await prisma.packages.findFirst({
    where: {
      id: bundle_id,
    },
    select: {
      price: true,
    },
  });
}


module.exports = {
  addBundle,
  getBundlesByShowId,
  verifyShowLinkedPackage,
  getBundleFeeFromBundleId,
};

