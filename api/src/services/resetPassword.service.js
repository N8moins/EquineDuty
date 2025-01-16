const prisma = require('../../prisma/client');

/**
 * Update a user to modify verif at true
 * @param {*} user_id user_id
 */
async function UpdateUserVerif(user_id) {
  await prisma.users.update({
    where: {
      id: user_id,
    },
    data: {
      is_verified: true,
    },
  });
}

module.exports = {
  UpdateUserVerif,
};

