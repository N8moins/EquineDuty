const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');
const {jwtUser1, jwtAdmin1} = require('./utils.js');
const bcrypt = require('bcryptjs');

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('PUT /users/id/profile', function() {
  test('responds with name, birthdate and phone updated', async () => {
    const user = {
      id: 1,
      name: 'Bob Allo',
      birthdate: '2023-02-02',
      phone: '444-444-44444',
    };
    const userModified = {
      name: 'Nathan Lessard',
      phone: '555-555-5555',
      birthdate: '2004-09-14',
    };
    prismaMock.users.findUnique.mockResolvedValue(user);
    prismaMock.users.update.mockResolvedValue(userModified);
    const response = await api.put('/api/users/1/profile')
        .set('Authorization', `${await jwtUser1()}`)
        .send(userModified);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name');
  });

  test('responds with passwords do not match', async () => {
    const user = {
      id: 1,
      password: 'hashedPassword',
    };
    prismaMock.users.findUnique.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);

    const response = await api.put('/api/users/1/password')
        .set('Authorization', `${await jwtUser1()}`)
        .send({
          old_password: 'wrongPassword',
          new_password: 'newPassword',
        });
    expect(response).toHaveProperty('error');
  });
});


describe('PUT /users/id/password', function() {
  test('responds with password updated', async () => {
    const user = {
      id: 1,
      password: 'Password123!',
    };
    prismaMock.users.findUnique.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('newHashedPassword');

    const response = await api.put('/api/users/1/password')
        .set('Authorization', `${await jwtUser1()}`)
        .send({
          old_password: 'Password123!',
          new_password: 'Newpass123!',
        });
    expect(response.body).toHaveProperty('message');
  });

  test('responds with passwords do not match', async () => {
    const user = {
      id: 1,
      password: 'hashedPassword',
    };
    prismaMock.users.findUnique.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);

    const response = await api.put('/api/users/1/password')
        .set('Authorization', `${await jwtUser1()}`)
        .send({
          old_password: 'wrongPassword',
          new_password: 'newPassword',
        });
    expect(response).toHaveProperty('error');
  });
});

describe('ADMIN PUT /users/id', function() {
  test('responds with user updated', async () => {
    const user = {
      id: 1,
      name: 'Name Name',
      email: 'email@email.com',
      role: 'USER',
      birthdate: new Date(),
      phone: '123-456-7890',
      is_verified: true,
    };
    prismaMock.users.update.mockResolvedValue(user);

    const response = await api.put('/api/users/1')
        .set('Authorization', `${await jwtAdmin1()}`)
        .send({
          name: 'Name Name',
          email: 'email@email.com',
          role: 'USER',
          birthdate: new Date(),
          phone: '123-456-7890',
          is_verified: true,
          is_active: true,
        });
    expect(response.body).toHaveProperty('id');
  });

  test('not authorized', async () => {
    const response = await api.put('/api/users/1')
        .set('Authorization', `${await jwtUser1()}`)
        .send({
          name: 'name',
          email: 'email',
          role: 'USER',
          birthdate: new Date(),
          phone: '123456789',
        });
    expect(response).toHaveProperty('error');
  });
});

describe('GET /users/id', function() {
  test('responds with user', async () => {
    const user = {
      id: 1,
      name: 'name',
      email: 'email',
      role: 'USER',
      birthdate: new Date(),
      phone: '123456789',
    };
    prismaMock.users.findUnique.mockResolvedValue(user);

    const response = await api.get('/api/users/1')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response.body).toHaveProperty('id');
  });
});

describe('GET /users', function() {
  test('Respond with 200 (no filter)', async () => {
    const mockUser = [
      {
        id: 1,
        name: 'John Doe',
        email: 'user@email.com',
        phone: '123-456-7890',
        role: 'USER',
      },
      {
        id: 2,
        name: 'Mark Admio',
        email: 'admin@email.com',
        phone: '123-456-1234',
        role: 'ADMIN',
      },
      {
        id: 3,
        name: 'Astarion Ancunin',
        email: 'secretary@email.com',
        phone: '123-987-123',
        role: 'SECRETARY',
      },
      {
        id: 4,
        name: 'Lola Sapristi',
        email: 'organizer@email.com',
        phone: '123-987-123',
        role: 'ORGANIZER',
      },
    ];
    prismaMock.users.findMany.mockResolvedValue(mockUser);
    const res = await api.get('/api/users')
        .set('Authorization', `${await jwtAdmin1()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('userslist');
    expect(res.body.userslist[0]).toHaveProperty('id');
    expect(res.body.pagination).toHaveProperty('current_page');
  });
});
