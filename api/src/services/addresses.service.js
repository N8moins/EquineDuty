const prisma = require('../../prisma/client');


/**
 * Add an address
 * @param {*} data
 * @param {int} user_id
 * @return {Promise<*>} new address
 */
async function addAddress(data, user_id) {
  const {
    street_address, province, country, city, zip_code, other_information,
  } = data;

  const newAddress = await prisma.address.create({
    data: {
      street_address,
      province,
      country,
      city,
      zip_code,
      other_information,
      organizer_id: user_id,
    },
  });

  return newAddress;
}

/**
 * Get addresses with user id
 * @param {int} user_id
 * @return {Promise<*>} address
 */
async function getAddressesWithUserId(user_id) {
  const addresses = await prisma.address.findMany({
    where: {
      organizer_id: user_id,
    },
  });

  return addresses;
}
/**
 * Get the address by address_id
 * @param {int} address_id
 * @param {int} organizer_id
 * @return {Promise<*>} address
 */
async function getAddressById(address_id, organizer_id) {
  const address = await prisma.address.findFirst({
    where: {
      id: address_id,
      organizer_id: organizer_id,
    },
  });
  return address;
}

/**
 * Get the address by address_id
 * @param {int} address_id
 * @param {int} organizer_id
 * @return {Promise<*>} address
 */
async function getAddressJustById(address_id) {
  const address = await prisma.address.findUnique({
    where: {
      id: address_id,
    },
  });
  return address;
}


module.exports = {
  addAddress,
  getAddressesWithUserId,
  getAddressById,
  getAddressJustById,
};
