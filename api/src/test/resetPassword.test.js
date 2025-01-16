const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');
const {jwtOrganizerFalseVerif, jwtOrganizer1,
  jwtSecretaryFalseVerif, jwtSecretary1} = require('./utils.js');

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const bcrypt = require('bcryptjs');

describe('PUT /resetpassword with organizer account', function() {
  test('responds with the password is updated', async () => {
    const user = {
      id: 1,
      password: 'hashedPassword',
    };
    prismaMock.users.findUnique.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('newHashedPassword');

    const password = {
      old_password: 'hashedPassword',
      new_password: 'newH@shedPa55word',
    };

    const response =
            await api.put('/api/resetpassword')
                .set('Authorization', `${await jwtOrganizerFalseVerif()}`)
                .send(password);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({message: 'Password updated'});

    const response2 =
            await api.put('/api/resetpassword')
                .set('Authorization', `${await jwtOrganizer1()}`)
                .send(password);
    expect(response2.statusCode).toBe(401);
  });
});

describe('PUT /resetpassword with secretary account', function() {
  test('responds with the password is updated', async () => {
    const user = {
      id: 1,
      password: 'hashedPassword',
    };
    prismaMock.users.findUnique.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('newHashedPassword');

    const password = {
      old_password: 'hashedPassword',
      new_password: 'password1234A@',
    };

    const response =
              await api.put('/api/resetpassword')
                  .set('Authorization', `${await jwtSecretaryFalseVerif()}`)
                  .send(password);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({message: 'Password updated'});

    const response2 =
              await api.put('/api/resetpassword')
                  .set('Authorization', `${await jwtSecretary1()}`)
                  .send(password);
    expect(response2.statusCode).toBe(401);
  });
});
