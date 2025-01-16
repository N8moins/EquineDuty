const supertest = require('supertest');
const {app} = require('../app.js');
const fs = require('fs');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');
const {jwtUser1} = require('./utils.js');

describe('POST /api/users/{userId}/horses', function() {
  test('responds with 201 created(image)', async () => {
    const horse = {
      id: 1,
      name: 'Rudolph',
      sex: 'colt',
      no_fei: '12345678',
      no_micro_chip: 'MIC456',
      path_vaccine: 'test-image.jpg',
      path_coggins: 'test-image.jpg',
      email_owner: 'Bob@gmail.com',
      fei_owner: '87654321',
      name_owner: 'Bob',
      phone_owner: '4505554444',
      user_id: 1,
    };
    prismaMock.horses.create.mockResolvedValue(horse);

    const response = await api.post('/api/users/1/horses')
        .set('Authorization', `${await jwtUser1()}`)
        .field('name', 'Bob')
        .field('sex', 'colt')
        .field('no_fei', '12345678')
        .field('no_micro_chip', 'MIC456')
        .field('email_owner', 'Bob@gmail.com')
        .field('fei_owner', '87654321')
        .field('name_owner', 'Bob Dylan')
        .field('phone_owner', '4505554444')
        .attach('vaccine', `${__dirname}/test-image.jpg`)
        .attach('coggins', `${__dirname}/test-image.jpg`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('sex', 'colt');
    expect(response.body).toHaveProperty('no_fei', '12345678');
    expect(response.body).toHaveProperty('no_micro_chip', 'MIC456');
    expect(response.body).toHaveProperty('path_vaccine');
    expect(response.body).toHaveProperty('path_coggins');
  });
  test('responds with 201 created(pdf)', async () => {
    const horse = {
      id: 2,
      name: 'Rudolph',
      sex: 'colt',
      no_fei: '12345678',
      no_micro_chip: 'MIC456',
      path_vaccine: 'test-image.jpg',
      path_coggins: 'test-image.jpg',
      email_owner: 'Bob@gmail.com',
      fei_owner: '87654321',
      name_owner: 'Bob',
      phone_owner: '4505554444',
      user_id: 1,
    };
    prismaMock.horses.create.mockResolvedValue(horse);

    const response = await api.post('/api/users/1/horses')
        .set('Authorization', `${await jwtUser1()}`)
        .field('name', 'Rudolph')
        .field('sex', 'colt')
        .field('no_fei', '12345678')
        .field('no_micro_chip', 'MIC456')
        .field('email_owner', 'Bob@gmail.com')
        .field('fei_owner', '87654321')
        .field('name_owner', 'Jean François')
        .field('phone_owner', '4505554444')
        .attach('vaccine', `${__dirname}/dummy.pdf`)
        .attach('coggins', `${__dirname}/dummy.pdf`);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('sex', 'colt');
    expect(response.body).toHaveProperty('no_fei', '12345678');
    expect(response.body).toHaveProperty('no_micro_chip', 'MIC456');
    expect(response.body).toHaveProperty('path_vaccine');
    expect(response.body).toHaveProperty('path_coggins');
  });
});

describe('DELETE /horse/id', function() {
  test('responds with horse', async () => {
    const horse = {
      name: 'Pale',
      sex: 'Male',
      no_fei: 'FEI123',
      no_micro_chip: 'MICROCHIP123',
      user_id: 1,
      path_vaccine: 'src/public/documents/test-image.jpg',
      path_coggins: 'src/public/documents/test-image.jpg',
      email_owner: 'Bob@gmail.com',
      fei_owner: '87654321',
      name_owner: 'Bob',
      phone_owner: '4505554444',
    };
    fs.appendFile('src/public/documents/test-image.jpg', 'test', (err) => {
      if (err) throw err;
    });
    prismaMock.horses.findUnique.mockResolvedValue({...horse, user_id: 1});
    prismaMock.horses.delete.mockResolvedValue(horse);
    const response = await api.delete('/api/users/1/horses/1')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response.body).toHaveProperty('name');
    expect(response.statusCode).toEqual(200);

    prismaMock.horses.findUnique.mockResolvedValue(undefined);
    prismaMock.horses.delete.mockResolvedValue(undefined);
    const response2 = await api.delete('/api/users/1/horses/1')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response2.body.error).toEqual('Horse id not found');
    expect(response2.statusCode).toEqual(404);
  });
});

describe('PUT /horses', function() {
  test('responds with horses', async () => {
    const horse = {
      name: 'Pale',
      sex: 'stallion',
      no_fei: '12365478',
      no_micro_chip: '232151225',
      user_id: 1,
      path_vaccine: 'src/public/documents/test-image.jpg',
      path_coggins: 'src/public/documents/test-image.jpg',
      email_owner: 'Bob@gmail.com',
      fei_owner: '12345679',
      name_owner: 'Bob Bobby',
      phone_owner: '450-555-4444',
    };

    const horseModify = {
      name: 'Rudolph',
      sex: 'colt',
      no_fei: '12345678',
      no_micro_chip: '55112299',
      user_id: 1,
      path_vaccine: 'src/public/documents/test-image.jpg',
      path_coggins: '',
      email_owner: 'Bob@gmail.com',
      fei_owner: '12345679',
      name_owner: 'Bob Bobby',
      phone_owner: '450-555-4444',
    };

    prismaMock.horses.create.mockResolvedValue(horse);
    prismaMock.horses.findUnique.mockResolvedValue({...horse, user_id: 1});
    prismaMock.horses.update.mockResolvedValue(horseModify);
    const response = await api.put('/api/users/1/horses/1')
        .set('Authorization', `${await jwtUser1()}`)
        .field('name', horseModify.name)
        .field('sex', horseModify.sex)
        .field('no_fei', horseModify.no_fei)
        .field('no_micro_chip', horseModify.no_micro_chip)
        .field('email_owner', horseModify.email_owner)
        .field('fei_owner', horseModify.fei_owner)
        .field('name_owner', horseModify.name_owner)
        .field('phone_owner', horseModify.phone_owner);

    expect(response.body).toHaveProperty('name', 'Rudolph');
    expect(response.body).toHaveProperty('sex', 'colt');
    expect(response.statusCode).toEqual(200);
  });
});

describe('GET /horses/id', function() {
  test('responds with horse', async () => {
    const horse = {
      id: 1,
      name: 'Pale',
      sex: 'Male',
      no_fei: 'FEI123',
      no_micro_chip: 'MICROCHIP123',
      user_id: 1,
      path_vaccine: 'src/public/documents/test-image.jpg',
      path_coggins: 'src/public/documents/test-image.jpg',
      email_owner: 'Bob@gmail.com',
      fei_owner: '87654321',
      name_owner: 'Bob',
      phone_owner: '4505554444',
    };
    prismaMock.horses.create.mockResolvedValue(horse);
    prismaMock.horses.findUnique.mockResolvedValue(horse);
    const response = await api.get('/api/users/1/horses/1')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('horse');
    expect(response.body).toHaveProperty('owner');
  });
});

describe('GET /horses', function() {
  test('responds with horses own by a user', async () => {
    const horse1 = {
      id: 1,
      name: 'Pale',
      sex: 'Male',
      no_fei: 'FEI123',
      no_micro_chip: 'MICROCHIP123',
      user_id: 1,
      path_vaccine: 'src/public/documents/test-image.jpg',
      path_coggins: 'src/public/documents/test-image.jpg',
      email_owner: 'Bob@gmail.com',
      fei_owner: '87654321',
      name_owner: 'Bob',
      phone_owner: '4505554444',
    };
    const horse2 = {
      id: 1,
      name: 'Pale',
      sex: 'Male',
      no_fei: 'FEI123',
      no_micro_chip: 'MICROCHIP123',
      user_id: 1,
      path_vaccine: 'src/public/documents/test-image.jpg',
      path_coggins: 'src/public/documents/test-image.jpg',
      email_owner: 'Bob@gmail.com',
      fei_owner: '87654321',
      name_owner: 'Bob',
      phone_owner: '4505554444',
    };
    prismaMock.horses.findMany.mockResolvedValue([horse1, horse2]);
    const response = await api.get('/api/users/1/horses')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response.statusCode).toEqual(200);

    prismaMock.horses.findMany.mockResolvedValue([]);
    const response2 = await api.get('/api/users/1/horses')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response2.statusCode).toEqual(204);
  });
});
