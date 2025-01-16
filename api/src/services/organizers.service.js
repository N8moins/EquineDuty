const prisma = require('../../prisma/client');
const {sendOrganizerAccountEmail} = require('../emails/organizersEmail');
const bcrypt = require('bcryptjs');
const {getUserByEmail} = require('../services/users.service');

/**
 * Update organizer
 * @param {*} _user user
 * @param {int} remaining_shows remaining_shows
 */
async function updateOrganizer(_user, remaining_shows) {
  const updatedUser = await prisma.users.update({
    where: {
      email: _user.email,
    },
    data: {
      role: 'ORGANIZER',
    },
  });

  const organizerShowExists = await prisma.organizerShows.findUnique({
    where: {
      user_id: updatedUser.id,
    },
  });

  if (organizerShowExists !== null && organizerShowExists !== undefined) {
    await prisma.organizerShows.update({
      where: {
        user_id: updatedUser.id,
      },
      data: {
        remaining_shows: remaining_shows,
      },
    });
  } else {
    await prisma.organizerShows.create({
      data: {
        remaining_shows: remaining_shows,
        user_id: updatedUser.id,
      },
    });
  }
}

/**
 * Create organizer account
 * @param {string} email email
 * @param {string} name name
 * @param {string} phone phone
 * @param {int} remaining_shows remaining_shows
 */
async function createOrganizer(email, name, phone, remaining_shows) {
  const _password = (Math.random()).toString(20).substring(2, 10);

  const createdUser = await prisma.users.create({
    data: {
      email: email,
      password: await bcrypt.hash(_password, 10),
      name: name,
      phone: phone,
      birthdate: new Date('2000-01-01'),
      role: 'ORGANIZER',
    },
  });

  await prisma.organizerShows.create({
    data: {
      remaining_shows: remaining_shows,
      user_id: createdUser.id,
    },
  });

  sendOrganizerAccountEmail(email, _password, name);
}

/**
 * Add organizer
 * @param {object} data data
 * @return {Promise<*>} result
 */
async function addOrganizers(data) {
  const {
    email,
    name,
    phone,
    remaining_shows,
  } = data;

  const _user = await getUserByEmail(email);

  if (_user !== null && _user !== undefined) {
    await prisma.$transaction(async (prisma) => {
      await updateOrganizer(_user, remaining_shows);
    });
    return 'User updated';
  } else {
    await prisma.$transaction(async (prisma) => {
      await createOrganizer(email, name, phone, remaining_shows);
    });
    return 'User created';
  }
}

module.exports = {
  addOrganizers,
};
