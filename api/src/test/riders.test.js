const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');
const {jwtUser1, jwtOrganizer1} = require('./utils.js');

describe('POST /riders', function() {
  test('responds with rider', async () => {
    const rider = {
      name: 'Test Tremblay',
      phone: '450-555-4444',
      email: 'test@email.com',
      no_fei: '58675786',
      emergency_name: 'Michel Michaud',
      emergency_phone: '514-000-5555',
      stable_name: 'Michmich',
      trainer_name: 'Seb Dj',
    };
    prismaMock.riders.create.mockResolvedValue(rider);

    const response = await api.post('/api/users/1/riders')
        .set('Authorization', `${await jwtUser1()}`)
        .send(rider);
    expect(response.body).toHaveProperty('name');
  });

  test('responds with missing name', async () => {
    prismaMock.riders.create.mockRejectedValueOnce(
        new Error('Mocked error for testing purposes'));

    const response = await api.post('/api/users/1/riders')
        .set('Authorization', `${await jwtUser1()}`)
        .send({
          phone: '4505554444',
          email: 'test@email.com',
          no_fei: '58675786',
          emergency_name: 'michel michaud',
          emergency_phone: '5140005555',
          stable_name: 'michmich',
          trainer_name: 'Seb DJ',
          user_id: 1,
        });
    expect(response).toHaveProperty('error');
  });
});

describe('PUT /riders', function() {
  test('responds with rider', async () => {
    const rider = {
      name: 'Test Michaud',
      phone: '450-555-4444',
      email: 'test@email.com',
      no_fei: '58675786',
      emergency_name: 'Michel Michaud',
      emergency_phone: '514-000-5555',
      stable_name: 'Michmich',
      trainer_name: 'Seb Dj',
    };

    prismaMock.inscriptions.findMany.mockResolvedValue([]);
    prismaMock.riders.update.mockResolvedValue(rider);
    prismaMock.riders.findFirst.mockResolvedValue({...rider, user_id: 1});

    const response = await api.put('/api/users/1/riders/1')
        .set('Authorization', `${await jwtUser1()}`)
        .send(rider);
    expect(response.body.name).toBe('Test Michaud');
  });
});


describe('GET /riders/id', function() {
  test('responds with rider', async () => {
    const rider = {
      id: 1,
      name: 'test',
      phone: '4505554444',
      email: 'test@email.com',
      no_fei: '58675786',
      emergency_name: 'michel michaud',
      emergency_phone: '5140005555',
      stable_name: 'michmich',
      trainer_name: 'Seb DJ',
      user_id: 1,
    };

    prismaMock.riders.findFirst.mockResolvedValue(rider);
    const response = await api.get('/api/users/1/riders/1')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response.body).toHaveProperty('id');
  });

  test('doesnt exist', async () => {
    prismaMock.riders.create.mockRejectedValueOnce(
        new Error('Mocked error for testing purposes'));
    const response = await api.get('/api/users/1/riders/123')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response).toHaveProperty('error');
  });
});

describe('GET /riders', function() {
  test('responds with riders', async () => {
    const rider = {
      id: 1,
      name: 'test',
      phone: '4505554444',
      email: 'test@email.com',
      no_fei: '58675786',
      emergency_name: 'michel michaud',
      emergency_phone: '5140005555',
      stable_name: 'michmich',
      trainer_name: 'Seb DJ',
    };

    prismaMock.riders.findMany.mockResolvedValue([{...rider}, {...rider}]);
    const response = await api.get('/api/users/1/riders')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('user doesnt exist', async () => {
    prismaMock.riders.findMany.mockRejectedValueOnce(
        new Error('Mocked error for testing purposes'));
    const response = await api.get('/api/users/123/riders')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response).toHaveProperty('error');
  });
});

describe('GET class/classId/riders', function() {
  test('responds with riders in the class', async () => {
    const rider = {
      id: 1,
      name: 'test',
      phone: '4505554444',
      email: 'test@email.com',
      no_fei: '58675786',
      emergency_name: 'michel michaud',
      emergency_phone: '5140005555',
      stable_name: 'michmich',
      trainer_name: 'Seb DJ',
    };
    prismaMock.shows.findUnique.mockResolvedValue({id: 1, organizer: {id: 1}});
    prismaMock.classes.findUnique.mockResolvedValue({id: 1, show_id: 1});
    prismaMock.classes_Inscriptions.findMany.mockResolvedValue(
        [{id: 1, inscription: {rider: rider}}]);
    prismaMock.inscriptions.findUnique.mockResolvedValue(
        {id: 1, rider: rider});
    const response = await api.get('/api/shows/1/classes/1/riders')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.status).toBe(200);

    prismaMock.shows.findUnique.mockResolvedValue({id: 1, organizer: {id: 1}});
    prismaMock.classes.findUnique.mockResolvedValue({id: 2, show_id: 1});
    prismaMock.classes_Inscriptions.findMany.mockResolvedValue([]);
    prismaMock.inscriptions.findUnique.mockResolvedValue();
    const response2 = await api.get('/api/shows/1/classes/2/riders')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response2.status).toBe(204);
  });
});


describe('DELETE /riders/id', function() {
  test('responds with rider', async () => {
    const rider = {
      id: 1,
      name: 'test',
      phone: '4505554444',
      email: 'test@email.com',
      no_fei: '58675786',
      emergency_name: 'michel michaud',
      emergency_phone: '5140005555',
      stable_name: 'michmich',
      trainer_name: 'Seb DJ',
      user_id: 1,
    };
    prismaMock.riders.findFirst.mockResolvedValue(rider);
    prismaMock.riders.delete.mockResolvedValue(rider);
    const response = await api.delete('/api/users/1/riders/1')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response.body).toHaveProperty('id');
  });

  test('user_id does not exist', async () => {
    prismaMock.users.findUnique.mockResolvedValue(undefined);

    const response = await api.delete('/api/users/100/riders/1')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response.status).toBe(404);
  });

  test('doesnt exist', async () => {
    prismaMock.riders.delete.mockRejectedValueOnce(
        new Error('Mocked error for testing purposes'));
    const response = await api.delete('/api/users/1/riders/123')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response).toHaveProperty('error');
  });
});

describe('GET middleware isRegistered...', function() {
  test('is registered, error', async () => {
    prismaMock.riders.findFirst.mockResolvedValue({id: 1});
    prismaMock.inscriptions.findMany.mockResolvedValue([{id: 1}]);
    const response = await api.delete('/api/users/1/riders/1')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response.status).toBe(403);
  });

  test('is not registered, goes into next()', async () => {
    prismaMock.inscriptions.findMany.mockResolvedValue([]);
    const rider = {
      id: 1,
      name: 'test',
      phone: '4505554444',
      email: 'test@email.com',
      no_fei: '58675786',
      emergency_name: 'michel michaud',
      emergency_phone: '5140005555',
      stable_name: 'michmich',
      trainer_name: 'Seb DJ',
      user_id: 1,
    };

    prismaMock.riders.findFirst.mockResolvedValue(rider);
    prismaMock.riders.delete.mockResolvedValue(rider);
    const response = await api.delete('/api/users/1/riders/1')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response.status).toBe(200);
  });
});
