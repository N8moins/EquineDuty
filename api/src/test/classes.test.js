const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');

const {jwtOrganizer1} = require('./utils.js');

const classesMiddleware = {
  number: 'pablo',
  name: 'Bechamel',
  date: '2021-02-01 10:00:00.000',
  price_entry: 275,
  is_test_of_choice: false,
  level_type: 'A',
  ring_name: 'Centre Bell',
  ring_number: '1',
  show: {
    id: 1,
    end_date: '2021-02-01 10:00:00.000',
    incription_start_date: '2021-02-02 10:00:00.000',
  },
};

describe('POST /classes', function() {
  test('responds with the classes value', async () => {
    const classes = {
      number: 'pablo',
      name: 'Bechamel',
      date: '2021-02-01 10:00:00.000',
      price_entry: 275,
      is_test_of_choice: false,
      level_type: 'A',
      ring_name: 'Centre Bell',
      ring_number: '1',
      test_id: 1,
      judges:
       [
         {
           ring_name: 'lol',
           name: 'Thomas',
           ring_position: 'C',
         },
       ],
    };
    prismaMock.shows.findUnique.mockResolvedValue({id: 1});
    prismaMock.classes.create.mockResolvedValue(classes);
    prismaMock.tests.findUnique.mockResolvedValue({id: 1, user_id: 1});

    const response = await api
        .post('/api/shows/1/classes')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(classes);
    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('number');
  });
});

describe('PUT /classes', function() {
  test('responds with the classes value', async () => {
    const _class = {
      number: 'pablo',
      name: 'Bechamel',
      date: '2021-02-01 10:00:00.000',
      price_entry: 275,
      is_test_of_choice: false,
      level_type: 'A',
      ring_name: 'Centre Bell',
      ring_number: '1',
      test_id: 1,
      judges:
       [
         {
           ring_name: 'lol',
           name: 'Thomas',
           ring_position: 'C',
         },
       ],
    };
    prismaMock.classes.findUnique.mockResolvedValueOnce({id: 1, show_id: 1});
    prismaMock.shows.findUnique.mockResolvedValue({
      id: 1,
      inscription_end_date: '2025-05-25',
      inscription_end_late_date: '2025-05-25',
      inscription_start_date: '2025-05-25'});
    prismaMock.classes.findUnique.mockResolvedValueOnce({id: 1, show: {
      id: 1,
      inscription_end_date: '2025-05-25',
      inscription_end_late_date: '2025-05-25',
      inscription_start_date: '2025-05-25',
    },
    });
    prismaMock.tests.findUnique.mockResolvedValue({id: 1, user_id: 1});

    const response = await api
        .put('/api/shows/1/classes/1')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send(_class);
    expect(response.statusCode).toEqual(201);
  });
});

describe('DELETE /classes/id', function() {
  test('responds with class', async () => {
    const classe = {
      number: 'Allo',
      name: 'Allo2',
      date: '2021-02-01 10:00:00.000',
      price_entry: 300,
      is_test_of_choice: false,
      level_type: 'A',
      ring_name: 'Centre Bell',
      ring_number: '1',
    };
    prismaMock.shows.findUnique.mockResolvedValue({id: 1});
    prismaMock.classes.findUnique.mockResolvedValueOnce(classe);
    prismaMock.classes.findUnique.mockResolvedValueOnce(classesMiddleware);
    prismaMock.classes.delete.mockResolvedValue(classe);

    const response = await api
        .delete('/api/shows/1/classes/1')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.body).toHaveProperty('number');
    expect(response.statusCode).toEqual(200);
  });
});

describe('DELETE /classes/id', function() {
  test('responds with class', async () => {
    const classe = {
      number: 'Allo',
      name: 'Allo2',
      date: '2021-02-01 10:00:00.000',
      price_entry: 300,
      is_test_of_choice: false,
      level_type: 'A',
      ring_name: 'Centre Bell',
      ring_number: '1',
    };
    prismaMock.shows.findUnique.mockResolvedValue({id: 1});
    prismaMock.classes.findUnique.mockResolvedValueOnce(classe);
    prismaMock.classes.findUnique.mockResolvedValueOnce(classesMiddleware);
    prismaMock.classes.delete.mockResolvedValue(classe);

    const response = await api
        .delete('/api/shows/1/classes/1')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.body).toHaveProperty('number');
    expect(response.statusCode).toEqual(200);
  });
});

describe('DELETE /classes/id', function() {
  test('responds class id not exist', async () => {
    prismaMock.shows.findUnique.mockResolvedValue({id: 1});
    prismaMock.classes.findUnique.mockResolvedValue(undefined);
    const response = await api
        .delete('/api/shows/1/classes/1')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.body.error).toEqual('Class id not found');
    expect(response.statusCode).toEqual(404);
  });
});

describe('DELETE /classes/id', function() {
  test('responds show is not exist', async () => {
    const classe = {
      number: 'Allo',
      name: 'Allo2',
      date: '2021-02-01 10:00:00.000',
      price_entry: 300,
      is_test_of_choice: false,
      level_type: 'A',
      ring_name: 'Centre Bell',
      ring_number: '1',
    };
    prismaMock.shows.findUnique.mockResolvedValue(undefined);
    prismaMock.classes.findUnique.mockResolvedValue(classe);
    prismaMock.classes.findUnique.mockResolvedValueOnce(classesMiddleware);
    prismaMock.classes.delete.mockResolvedValue(classe);
    const response = await api
        .delete('/api/shows/1/classes/1')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.body.error).toEqual('Show id not found');
    expect(response.statusCode).toEqual(404);
  });
});

describe('GET shows/showId/classes', function() {
  test('responds with the classes with there show id', async () => {
    const classe = {
      number: 'Allo',
      name: 'Allo2',
      date: '2021-02-01 10:00:00.000',
      price_entry: 300,
      user_id: 1,
      is_test_of_choice: false,
      level_type: 'A',
      ring_name: 'Centre Bell',
      ring_number: '1',
    };
    prismaMock.shows.findUnique.mockResolvedValue({id: 1});
    prismaMock.classes.findMany.mockResolvedValue([classe]);
    const response = await api
        .get('/api/shows/1/classes')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.statusCode).toEqual(200);
  });
});

describe('GET shows/showId/classes/classId/judges', function() {
  test('responds with judges with there class id', async () => {
    prismaMock.classes.findUnique.mockResolvedValue({id: 1, show_id: 1});
    prismaMock.shows.findUnique.mockResolvedValue({id: 1});
    prismaMock.judges_Classes.findMany.mockResolvedValue([{id: 1}]);
    const response = await api
        .get('/api/shows/1/classes/1/judges')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.statusCode).toEqual(200);
  });
});
