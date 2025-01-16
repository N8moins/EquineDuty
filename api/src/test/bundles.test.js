require('dotenv').config();
const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');
const {jwtOrganizer1} = require('./utils.js');

describe('POST /bundles', function() {
  test('responds with the bundle value', async () => {
    const bundle = {
      description: 'Allo',
      price: 400,
      chiving: 100,
      hays: 40,
      name: 'name',
      stalls: '4',
      tack_stalls: '4',
    };
    const _bundle = {
      show_id: 1,
      package_id: 1,
    };
    prismaMock.shows.findUnique.mockResolvedValue({
      id: 1,
      organizer: {id: 1},
      nb_temp_stalls: 1,
      nb_permanent_stalls: 8,
      nb_free_temp_stalls: 1,
      nb_free_permanent_stalls: 8,
    });
    prismaMock.packages.create.mockResolvedValue(bundle);
    prismaMock.shows_Packages.create.mockResolvedValue(_bundle);

    const response = await api.post('/api/shows/1/bundles')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(bundle);
    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('description');

    prismaMock.shows.findUnique.mockResolvedValue({id: 1, organizer: {id: 12}});
    prismaMock.packages.create.mockResolvedValue(bundle);
    prismaMock.shows_Packages.create.mockResolvedValue(_bundle);
    const response2 = await api.post('/api/shows/1/bundles')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(bundle);
    expect(response2.statusCode).toEqual(404);
    expect(response2.body)
        .toEqual({'error': 'The user does not own the show.'});

    prismaMock.shows.findUnique.mockResolvedValue({
      id: 1,
      organizer: {id: 1},
      nb_temp_stalls: 1,
      nb_permanent_stalls: 0,
      nb_free_temp_stalls: 1,
      nb_free_permanent_stalls: 0,
    });
    prismaMock.packages.create.mockResolvedValue(bundle);
    prismaMock.shows_Packages.create.mockResolvedValue(_bundle);
    const response3 = await api.post('/api/shows/1/bundles')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(bundle);
    expect(response3.statusCode).toEqual(400);
  });
});

describe('GET /bundles', function() {
  test('responds with the bundles', async () => {
    prismaMock.shows.findUnique.mockResolvedValue({id: 1, organizer: {id: 1}});
    prismaMock.shows_Packages.findMany.mockResolvedValue([]);
    const bundle = {
      description: 'Box, cleaning, hay',
      price: 400,
    };
    const bundle2 = {
      description: 'Box, cleaning, hay',
      price: 450,
    };
    const response = await api.get('/api/shows/1/bundles')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.statusCode).toEqual(204);

    prismaMock.shows.findUnique.mockResolvedValue({id: 1, organizer: {id: 1}});
    prismaMock.shows_Packages.findMany.mockResolvedValue([bundle, bundle2]);

    const response2 = await api.get('/api/shows/1/bundles')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response2.statusCode).toEqual(200);
  });
});

