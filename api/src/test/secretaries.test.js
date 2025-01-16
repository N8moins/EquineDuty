const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');
const {jwtOrganizer1, jwtAdmin1} = require('./utils.js');

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('POST /shows/:showId/secretaries', function() {
  test('responds with the user is update', async () => {
    const user = {
      name: 'Bob Tremblay',
      email: 'Bob@gmail.com',
      phone: '450-555-4444',
    };
    prismaMock.users.create.mockResolvedValue(user);
    prismaMock.users.findUnique.mockResolvedValue(user);
    prismaMock.users.update.mockResolvedValue(user);
    prismaMock.shows.findUnique.mockResolvedValue({id: 1, organizer: {id: 1}});

    prismaMock.users.findUnique.mockResolvedValue(user);

    const response =
            await api.post('/api/shows/1/secretaries')
                .set('Authorization', `${await jwtOrganizer1()}`)
                .send(user);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('User updated');
  });
});

describe('POST /shows/:showId/secretaries', function() {
  test('responds is created if the user does not exist', async () => {
    const user = {
      name: 'Bob Tremblay',
      email: 'Bob@gmail.com',
      phone: '450-555-4444',
    };
    prismaMock.users.findUnique.mockResolvedValue(undefined);
    prismaMock.shows.findUnique.mockResolvedValue({id: 1, organizer: {id: 1}});
    prismaMock.users.create.mockResolvedValue(user);

    const response =
            await api.post('/api/shows/1/secretaries')
                .set('Authorization', `${await jwtOrganizer1()}`)
                .send(user);
    expect(response.statusCode).toBe(201);
    expect(response.body).toBe('User created');
  });
});


describe('DELETE /secretaries', function() {
  test('responds that the user was deleted', async () => {
    const user = {
      name: 'Bob Tremblay',
      email: 'kakacool2000@gmail.com',
      phone: '450-555-4444',
      role: 'SECRETARY',
    };
    prismaMock.users.findUnique.mockResolvedValue(user);
    prismaMock.shows.update.mockResolvedValue({id: 1});

    const shows = {id: 1, organizer: {id: 2},
      secretary: {id: 3, name: 'Bob', email: 'asd@gmail.com',
        role: 'SECRETARY'}};
    prismaMock.shows.findUnique.mockResolvedValue(shows);
    prismaMock.users.update.mockResolvedValue(user);

    const response =
            await api.delete('/api/shows/1/secretaries')
                .set('Authorization', `${await jwtAdmin1()}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Secretary removed from show successfully');
  });

  test('response if the user is either not an secretary or doesn\'t exist',
      async () => {
        const user = {
          name: 'Bob Tremblay',
          email: 'kakacool2000@gmail.com',
          phone: '450-555-4444',
          role: 'SECRETARY',
        };
        prismaMock.users.findUnique.mockResolvedValue(user);

        const shows = {id: 1, organizer: {id: 2},
          secretary: {id: 3, name: 'Bob', email: 'asd@gmail.com',
            role: 'ORGANIZER'}};
        prismaMock.shows.findUnique.mockResolvedValue(shows);
        prismaMock.users.update.mockResolvedValue(user);


        const response =
            await api.delete('/api/shows/5/secretaries')
                .set('Authorization', `${await jwtAdmin1()}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.error)
            .toBe('Secretary id does not have the role secretary');
      });
});
