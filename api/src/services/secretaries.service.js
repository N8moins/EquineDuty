const prisma = require('../../prisma/client');
const {sendSecretaryAccountEmail} = require('../emails/secretariesEmail');
const bcrypt = require('bcryptjs');
const {getUserByEmail} = require('../services/users.service');

/**
 * Add a secretary
 * @param {*} data data
 * @param {*} show_id show_id
 * @return {string} User updated or User created
 */
async function addSecretary(data, show_id) {
  const {
    email,
    name,
    phone,
  } = data;

  const _user = await getUserByEmail(email);
  let _secretary;


  if (_user !== null && _user !== undefined) {
    if (_user.role === 'ORGANIZER' || _user.role === 'ADMIN') {
      return 'User is an organizer or admin';
    }
    _secretary = await prisma.users.update({
      where: {
        email: email,
      },
      data: {
        role: 'SECRETARY',
      },
    });
    await linkSecretaryToShow(show_id, _secretary.id);
    return 'User updated';
  } else {
    const _password = (Math.random()).toString(20).substring(2, 10);
    _secretary = await prisma.users.create({
      data: {
        email: email,
        password: await bcrypt.hash(_password, 10),
        name: name,
        phone: phone,
        birthdate: new Date('2000-01-01'),
        role: 'SECRETARY',
      },
    });
    await linkSecretaryToShow(show_id, _secretary.id);
    sendSecretaryAccountEmail(email, _password, name);
    return 'User created';
  }
}


/**
 * Removes secretary role from a user
 * @param {int} secreatary_id secreatary_id
 * @return {Promise<*>} secretary
 */
async function removeSecretaryRoleById(secreatary_id) {
  return await prisma.users.update({
    where: {
      id: secreatary_id,
      role: 'SECRETARY',
    },
    data: {
      role: 'USER',
    },
  });
}


/**
 * link a secretary to a show
 *
 * @param {*} show_id show_id
 * @param {*} _secretary_id show_id
 */
async function linkSecretaryToShow(show_id, _secretary_id) {
  await prisma.shows.update({
    where: {
      id: parseInt(show_id),
    },
    data: {
      secretary_id: parseInt(_secretary_id),
    },
  });
}

/**
 * Removes secretary role from a user
 * @param {int} show_id show_id
 * @param {int} organizer_id organizer_id
 */
async function removeSecretaryInShow(show_id, organizer_id) {
  await prisma.shows.update({
    where: {
      id: show_id,
    },
    data: {
      secretary_id: organizer_id,
    },
  });
}

module.exports = {
  addSecretary,
  removeSecretaryRoleById,
  removeSecretaryInShow,
};
