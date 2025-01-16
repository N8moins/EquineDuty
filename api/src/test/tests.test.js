const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');

const {jwtOrganizer1} = require('./utils.js');

const mark = {
  move_name: 'Jump',
  note: 1,
  coef_points: 2,
  type: 'STANDARD',
};

describe('POST /tests', function() {
  test('responds with the test value', async () => {
    const test = {
      number: 'ABC100',
      name: 'Chevaux',
      short_name: 'Cheval',
      points_precision: 2,
      duration_minute: 20,
      nb_standard_marks: 10,
      nb_collectives_marks: 15,
      total_points_possibility: 100,
      marks: [mark],
    };

    const test2 = {
      number: 'ABC100',
      name: 'Chevaux',
      short_name: 'Cheval',
      points_precision: 2,
      duration_minute: 20,
      nb_standard_marks: 0,
      nb_collectives_marks: 15,
      total_points_possibility: 100,
      marks: [mark],
    };

    prismaMock.tests.create.mockResolvedValue(test);

    const response = await api.post('/api/users/1/tests')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(test);


    expect(response.statusCode).toEqual(201);

    prismaMock.tests.create.mockResolvedValue(test2);

    const response2 = await api.post('/api/users/1/tests')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(test2);


    expect(response2.statusCode).toEqual(403);
  });
});

describe('PUT /tests', function() {
  test('responds with the test value', async () => {
    const test = {
      number: 'ABC100',
      name: 'Chevaux',
      short_name: 'Cheval',
      points_precision: 2,
      duration_minute: 20,
      nb_standard_marks: 10,
      nb_collectives_marks: 15,
      total_points_possibility: 100,
      marks: [mark],
    };
    const testModified = {
      number: 'ABC102',
      name: 'Cheval',
      short_name: 'Che',
      points_precision: 3,
      duration_minute: 50,
      nb_standard_marks: 20,
      nb_collectives_marks: 25,
      total_points_possibility: 200,
      marks: [mark],
    };
    prismaMock.classes.findFirst.mockResolvedValue({id: 1, show_id: 1});
    prismaMock.shows.findUnique.mockResolvedValue({id: 1, is_published: 1});
    prismaMock.tests.findUnique.mockResolvedValue({test, user_id: 1});
    prismaMock.marks.deleteMany.mockResolvedValue(mark);
    prismaMock.marks.create.mockResolvedValue(mark);
    prismaMock.tests.update.mockResolvedValue(testModified);

    const response1 = await api.put('/api/users/1/tests/1')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(testModified);
    expect(response1.statusCode).toEqual(403);

    prismaMock.classes.findFirst.mockResolvedValue({id: 1, show_id: 1});
    prismaMock.shows.findUnique.mockResolvedValue({id: 1, is_published: 0});
    prismaMock.tests.findUnique.mockResolvedValue({test, user_id: 1});

    prismaMock.tests.update.mockResolvedValue(testModified);

    const response2 = await api.put('/api/users/1/tests/1')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(testModified);
    expect(response2.statusCode).toEqual(200);

    prismaMock.classes.findFirst.mockResolvedValue();
    prismaMock.tests.findUnique.mockResolvedValue({test, user_id: 1});

    prismaMock.tests.update.mockResolvedValue(testModified);

    const response3 = await api.put('/api/users/1/tests/1')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(testModified);
    expect(response3.statusCode).toEqual(200);
  });
});

describe('POST /test', function() {
  test('responds with a error if the validation is not correct', async () => {
    const test = {
      number: '',
      name: 'Chevaux',
      short_name: 'Cheval',
      points_precision: -42412412,
      duration_minute: 20,
      nb_standard_marks: 10,
      nb_collectives_marks: 15,
      total_points_possibility: 100,
    };
    prismaMock.tests.create.mockResolvedValue(test);
    const response = await api.post('/api/users/1/tests')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(test);
    expect(response.statusCode).toEqual(400);
  });
});

describe('PUT /test/:testId/class/:classId', function() {
  test('responds with 201 when succesfully Link a test to a classes',
      async () => {
        const test = {
          number: 'ABC100',
          name: 'Chevaux',
          short_name: 'Cheval',
          points_precision: 20,
          duration_minute: 20,
          nb_standard_marks: 10,
          nb_collectives_marks: 15,
          total_points_possibility: 100,
        };

        const class1 = {
          number: 'pablo',
          name: 'Bechamel',
          date: '2021-02-01 10:00:00.000',
          price_entry: 275,
          is_test_of_choice: false,
          level_type: 'A',
          ring: 'A',
          ring_name: 'Centre Bell',
          ring_number: '1',
        };

        prismaMock.tests.create.mockResolvedValue(test);

        await api.post('/api/users/1/tests')
            .set('Authorization', `${await jwtOrganizer1()}`)
            .send(test);

        prismaMock.tests.create.mockResolvedValue(class1);

        await api.post('/api/shows/1/classes')
            .set('Authorization', `${await jwtOrganizer1()}`)
            .send(class1);

        const link = {
          test_id: 1,
          class_id: 1,
        };

        prismaMock.tests.create.mockResolvedValue(link);

        const response = await api.put('/api/users/1/tests/1/class/1')
            .set('Authorization', `${await jwtOrganizer1()}`);

        expect(response.statusCode).toEqual(201);
      });
});

describe('GET /tests', function() {
  test('responds with 200 when succesfully get all tests', async () => {
    const test = {
      number: 'ABC100',
      name: 'Chevaux',
      short_name: 'Cheval',
      points_precision: 20,
      duration_minute: 20,
      nb_standard_marks: 10,
      nb_collectives_marks: 15,
      total_points_possibility: 100,
    };

    prismaMock.tests.findMany.mockResolvedValue([{...test}, {...test}]);

    const response = await api.get('/api/users/1/tests')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.statusCode).toEqual(200);
  });
});

describe('GET /tests/testId', function() {
  test('responds with 200 when succesfully get the test by id', async () => {
    const test = {
      'id': 1,
      'number': '12',
      'name': 'Allo',
      'short_name': 'A',
      'points_precision': 13,
      'duration_minute': 20,
      'nb_standard_marks': 25,
      'nb_collectives_marks': 25,
      'total_points_possibility': 50,
      'user': {
        'id': 1,
      },
      'Marks': [
        {
          'id': 1,
          'move_name': 'JUMP',
          'note': 2,
          'coef_points': 3.3,
          'type': 'COLLECTIVE',
        },
        {
          'id': 2,
          'move_name': 'JUMP',
          'note': 3,
          'coef_points': 3.3,
          'type': 'COLLECTIVE',
        },
      ],
    };

    prismaMock.tests.findUnique.mockResolvedValue(test);

    const response = await api.get('/api/users/1/tests/testId')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('Marks');
    expect(response.body.Marks[1]).toHaveProperty('id');
  });
});

describe('Delete /tests/:testId', function() {
  test('responds with 200 when succesfully delete', async () => {
    prismaMock.tests.findUnique.mockResolvedValue({id: 1, user_id: 1});
    prismaMock.tests.delete.mockResolvedValue({id: 1, user_id: 1});

    const response = await api.delete('/api/users/1/tests/1')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.statusCode).toEqual(200);
    const response2= await api.delete('/api/users/2/tests/1')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response2.statusCode).toEqual(403);
  });
});
