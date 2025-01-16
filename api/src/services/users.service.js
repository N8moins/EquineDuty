const prisma = require('../../prisma/client');

const userFormat = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
};

/**
 * Update user password
 * @param {int} user_id user_id
 * @param {string} hashedPassword new hashedPassword
 */
async function updateUserPassword(user_id, hashedPassword) {
  await prisma.users.update({
    where: {
      id: user_id,
    },
    data: {
      password: hashedPassword,
    },
  });
}

/**
 * Get a user by his email
 * @param {*} email email
 * @return {Promise<*>} new class
 */
async function getUserByEmail(email) {
  const user = await prisma.users.findUnique({
    where: {
      email: email,
    },
  });
  return user;
}

/**
 * Get user by id
 * @param {int} user_id user_id
 * @return {Promise<*>} user
 */
async function getUserById(user_id) {
  const user = await prisma.users.findUnique({
    where: {
      id: user_id,
    },
  });

  if (user.role === 'ORGANIZER') {
    const organizerInfo = await prisma.organizerShows.findUnique({
      where: {
        user_id: user.id,
      },
      select: {
        remaining_shows: true,
      },
    });
    if (organizerInfo) {
      user.remaining_shows = organizerInfo.remaining_shows;
    }
  }

  if (user.role === 'ORGANIZER' || user.role === 'ADMIN') {
    const stripeConnected = await prisma.stripeAccountUsers.findUnique({
      where: {
        user_id: user_id,
      },
    });
    if (stripeConnected) {
      user.stripe_connected = true;
    } else {
      user.stripe_connected = false;
    }
  }

  return user;
}

/**
 * Update user
 * @param {int} user_id user_id
 * @param {object} data data
 * @return {Promise<*>} updated user
 */
async function updateUser(user_id, data) {
  let remaining_shows = null;
  if (data.remaining_shows !== undefined) {
    remaining_shows = data.remaining_shows;
    data.remaining_shows = undefined;
  }

  const updatedUser = await prisma.users.update({
    where: {
      id: user_id,
    },
    data: data,
  });

  if (remaining_shows !== undefined && remaining_shows !== null) {
    await updateOrganizerShows(updatedUser, parseInt(remaining_shows));
    if (updatedUser.role === 'ORGANIZER') {
      updatedUser.remaining_shows = remaining_shows;
    }
  }

  return updatedUser;
}

/**
 * Update organizer shows
 * @param {int} updatedUser updated user
 * @param {int} remaining_shows remaining_shows
 */
async function updateOrganizerShows(updatedUser, remaining_shows) {
  if (updatedUser.role === 'ORGANIZER') {
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
}

/**
 * Get users by filters.
 * @param {*} req HTTP request.
 * @param {Array} filters Array of filters.
 * @return {Promise<*>} List of users
 */
async function getUsersListByFilters(req, filters) {
  const page = req.query.page ?
   (isNaN(req.query.page) ? 1 : parseInt(req.query.page)) : 1;
  const resultsPerPage = 10;

  const queryOptions = {
    take: resultsPerPage,
    skip: (page - 1) * resultsPerPage,
    select: userFormat,
  };

  for (const filterObj of filters) {
    const {filter, value} = filterObj;
    switch (filter) {
      case 'name':
        queryOptions.where = {
          ...queryOptions.where,
          name: {
            contains: value,
          },
        };
        break;
      case 'email':
        queryOptions.where = {
          ...queryOptions.where,
          email: {
            contains: value,
          },
        };
        break;
      case 'role':
        if (!queryOptions.where) queryOptions.where = {};
        if (!queryOptions.where.OR) queryOptions.where.OR = [];
        const roles = Array.isArray(value) ? value : [value];
        roles.forEach((role) => {
          queryOptions.where.OR.push({role});
        });
        break;
      default:
        break;
    }
  }

  const dbResult = await prisma.users.findMany(queryOptions);
  for (const user of dbResult) {
    if (user.role === 'ORGANIZER') {
      const organizerInfo = await prisma.organizerShows.findUnique({
        where: {
          user_id: user.id,
        },
        select: {
          remaining_shows: true,
        },
      });
      if (organizerInfo) {
        user.remaining_shows = organizerInfo.remaining_shows;
      }
    }
  }


  const totalUsersCount = await prisma.users.count({where: queryOptions.where});

  const totalPages = Math.ceil(totalUsersCount / resultsPerPage);
  const next_page = page < totalPages ? page + 1 : null;
  const prev_page = page > 1 ? page - 1 : null;


  const dbUsersList = addCount({userslist: dbResult},
      totalUsersCount, page, resultsPerPage, next_page, prev_page);

  return dbUsersList;
}

/**
 * Add pagination details to the result.
 * @param {*} dbResult Database result.
 * @param {Int} totalUsers Total number of users.
 * @param {Int} page Current page.
 * @param {Int} resultsPerPage Results per page.
 * @param {Int} next_page Next page number.
 * @param {Int} prev_page Previous page number.
 * @return {*} List of users with pagination details.
 */
function addCount(
    dbResult, totalUsers, page, resultsPerPage, next_page, prev_page) {
  const paginate = {
    pagination: {
      total_records: totalUsers,
      current_page: page,
      total_pages: Math.ceil(totalUsers / resultsPerPage),
      next_page: next_page,
      prev_page: prev_page,
    },
  };
  return {...dbResult, ...paginate};
}

/**
 * Get user role by id
 * @param {int} user_id user_id
 * @return {Promise<*>} user
 */
async function getUserRoleById(user_id) {
  const role = await prisma.users.findUnique({
    where: {
      id: user_id,
    },
    select: {
      role: true,
    },
  });


  return role;
}


module.exports = {
  updateUserPassword,
  getUserById,
  updateUser,
  getUserByEmail,
  getUsersListByFilters,
  getUserRoleById,
};
