const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');

const {jwtOrganizer1} = require('./utils.js');

describe('POST address', function() {
  test('responds with the address', async () => {
    const address = {
      street_address: '123 rue de la paix',
      province: 'Ile de France',
      country: 'France',
      city: 'Paris',
      zip_code: 'B2A3B4',
      other_information: 'some other',
    };
    prismaMock.address.create.mockResolvedValue(address);
    const response = await api.post('/api/users/1/address')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(address);

    expect(response.statusCode).toEqual(201);
    expect(response.body.street_address).toBe('123 rue de la paix');
    expect(response.body.city).toBe('Paris');
  });

  test('responds with an error message when missing a field', async () => {
    const address = {
      street_address: '123 rue de la paix',
      province: 'Ile de France',
      country: 'France',
      city: 'Paris',
      other_information: 'some other',
    };

    prismaMock.address.create.mockRejectedValue(new Error('error message'));
    const response = await api.post('/api/users/1/address')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(address);

    expect(response.statusCode).toEqual(400);
  });
});

describe('GET address by user id ', function() {
  test('responds with the address', async () => {
    const address = {
      street_address: '123 rue de la paix',
      province: 'Ile de France',
      country: 'France',
      city: 'Paris',
      zip_code: 'B2A3B4',
      other_information: 'some other',
    };
    prismaMock.address.findMany.mockResolvedValue(address);

    const response = await api.get('/api/users/1/address')
        .set('Authorization', `${await jwtOrganizer1()}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body.street_address).toBe('123 rue de la paix');
    expect(response.body.city).toBe('Paris');
  });
});
