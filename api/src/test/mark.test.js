const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');

const {jwtOrganizer1} = require('./utils.js');

describe('POST test/:testId/mark', function() {
  test('responds with the mark value', async () => {
    const test = {
      number: 'ABC100',
      name: 'Chevaux',
      short_name: 'Cheval',
      points_precision: 20,
      duration_minute: 20,
      nb_standard_makrs: 2,
      nb_collectives_makrs: 2,
      total_points_possibility: 100,
    };
    prismaMock.tests.create.mockResolvedValue(test);
    api.post('/api/users/1/tests')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(test);
    const mark = {
      move_name: 'Jump',
      note: 1,
      coef_points: 2,
      type: 'STANDARD',
    };
    prismaMock.tests.findUnique.mockResolvedValue(test);
    prismaMock.marks.findMany.mockResolvedValue([]);
    prismaMock.marks.create.mockResolvedValue(mark);

    const response = await api.post('/api/users/1/test/1/mark')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(mark);
    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('move_name');
    expect(response.body.move_name).toBe('Jump');
    expect(response.body.type).toBe('STANDARD');
  });
});

describe('POST test/:dressageId/mark', function() {
  test('responds with a error if the validation is not correct', async () => {
    const test = {
      number: 'ABC100',
      name: 'Chevaux',
      short_name: 'Cheval',
      points_precision: 20,
      duration_minute: 20,
      nb_standard_makrs: 2,
      nb_collectives_makrs: 2,
      total_points_possibility: 100,
    };
    prismaMock.tests.create.mockResolvedValue(test);
    api.post('/api/users/1/tests')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(test);
    const mark = {
      move_name: '',
      note: 'das',
      coef_points: 2,
      type: 'STANDARD',
    };
    prismaMock.tests.findUnique.mockResolvedValue(test);
    prismaMock.marks.findMany.mockResolvedValue([]);
    prismaMock.marks.create.mockResolvedValue(mark);
    const response = await api.post('/api/users/1/test/1/mark')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(mark);
    expect(response.statusCode).toEqual(400);
  });
});

describe('POST test/:dressageId/mark', function() {
  test('responds with a error if the test does not exist', async () => {
    const mark = {
      move_name: 'Cheval',
      note: 30,
      coef_points: 2,
      type: 'STANDARD',
    };
    prismaMock.tests.findUnique.mockResolvedValue(null);
    prismaMock.marks.findMany.mockResolvedValue([]);
    prismaMock.marks.create.mockResolvedValue(mark);
    const response = await api.post('/api/users/1/test/10000/mark')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(mark);
    expect(response.statusCode).toEqual(404);
  });
});

describe('POST test/:dressageId/mark', function() {
  test('responds with a error if the marks count is not valide', async () => {
    const test = {
      number: 'ABC100',
      name: 'Chevaux',
      short_name: 'Cheval',
      points_precision: 20,
      duration_minute: 20,
      nb_standard_makrs: 1,
      nb_collectives_makrs: 1,
      total_points_possibility: 100,
    };
    prismaMock.tests.create.mockResolvedValue(test);
    api.post('/api/users/1/test')
        .send(test);
    const mark = {
      move_name: 'Cheval',
      note: 30,
      coef_points: 2,
      type: 'STANDARD',
    };
    prismaMock.tests.findUnique.mockResolvedValue(test);
    prismaMock.marks.findMany.mockResolvedValue([]);
    prismaMock.marks.create.mockResolvedValue(mark);
    const response = await api.post('/api/users/1/test/1/mark')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(mark);
    expect(response.statusCode).toEqual(201);
    prismaMock.tests.findUnique.mockResolvedValue(test);
    prismaMock.marks.findMany.mockResolvedValue([mark]);
    prismaMock.marks.create.mockResolvedValue(mark);
    const response2 = await api.post('/api/users/1/test/1/mark')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(mark);
    expect(response2.statusCode).toEqual(401);
  });
});
