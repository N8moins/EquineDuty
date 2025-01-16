const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');
const {jwtAdmin1} = require('./utils.js');

describe('POST /organizer', function() {
  test('responds with the user is update', async () => {
    const user = {
      name: 'Bob Tremblay',
      email: 'Bob@gmail.com',
      phone: '450-555-4444',
      remaining_shows: 5,
    };
    prismaMock.organizerShows.findUnique.mockResolvedValue({});
    prismaMock.organizerShows.update.mockResolvedValue({});
    prismaMock.organizerShows.create.mockResolvedValue({});
    prismaMock.users.create.mockResolvedValue(user);
    prismaMock.users.findUnique.mockResolvedValue(user);

    const response =
          await api.post('/api/organizers')
              .set('Authorization', `${await jwtAdmin1()}`)
              .send(user);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('User updated');
  });
});

describe('POST /organizer', function() {
  test('responds is created if the user does not exist', async () => {
    const user = {
      name: 'Bob Tremblay',
      email: 'Bob@gmail.com',
      phone: '450-555-4444',
      remaining_shows: 5,
    };
    prismaMock.organizerShows.findUnique.mockResolvedValue({});
    prismaMock.organizerShows.update.mockResolvedValue({});
    prismaMock.organizerShows.create.mockResolvedValue({});
    prismaMock.users.findUnique.mockResolvedValue(undefined);
    prismaMock.users.create.mockResolvedValue(user);

    const response =
          await api.post('/api/organizers')
              .set('Authorization', `${await jwtAdmin1()}`)
              .send(user);
    expect(response.statusCode).toBe(201);
    expect(response.body).toBe('User created');
  });
});

