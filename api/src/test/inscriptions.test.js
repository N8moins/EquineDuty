const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');
const {jwtUser1, jwtOrganizer1, jwtAdmin1} = require('./utils.js');

beforeEach(() => {
  prismaMock.horses.findUnique.mockResolvedValue({});
  prismaMock.users.findUnique.mockResolvedValue({});
  prismaMock.classes.findUnique.mockResolvedValue({});
  prismaMock.shows.findUnique.mockResolvedValue({});
  prismaMock.riders.findUnique.mockResolvedValue({});
});

describe('POST /inscriptions', function() {
  test('responds with inscription', async () => {
    const inscription = {
      horse_id: 1,
      rider_id: 1,
      no_fei: '58675786',
      nb_stalls: 2,
      nb_tack_stalls: 2,
      nb_hay_bale: 2,
      nb_chiving_bags: 2,
      show_asked_codes: null,
      nb_days: 2,
      Shows_Packages: [
        {id: 1, count: 2},
      ],
    };

    const mockedShow = {
      id: 1,
      name: 'test',
      address_id: 1,
      nb_total_place: 10,
      nb_free_place: 10,
      nb_temp_stalls: 10,
      nb_tack_stalls: 10,
      nb_free_temp_stalls: 10,
      nb_free_tack_stalls: 10,
      nb_free_permanent_stalls: 10,
      nb_permanent_stalls: 10,
      recognized_show: true,
      rules: 'no rules haha',
      start_date: '2024-05-25',
      end_date: '2024-05-26',
      can_have_late_registration: true,
      inscription_end_date: '2024-05-20',
      inscription_end_late_date: '2024-05-24',
      inscription_start_date: '2024-01-15',
      administration: 2500,
      late_inscription: 2500,
      cancel_inscription: 5000,
      ground: 1000,
      paramedics: 12000,
      camper_ground_rental: 4000,
      asked_codes: 'fei_canada,fei_quebec',
      hay: 1000,
      chiving: 2000,
      temp_stall_per_day: 6000,
      permanent_stall_per_day: 14000,
      tack_stall_per_day: 8000,
      drug_test: 3500,
      is_published: true,
    };

    prismaMock.shows_Asked_Codes.findMany.mockResolvedValue({});
    prismaMock.$transaction.mockResolvedValue(inscription);
    prismaMock.inscriptions.count.mockResolvedValue(0);
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);
    prismaMock.shows_Fees.findUnique.mockResolvedValue({});
    prismaMock.administration_Fees.findUnique.mockResolvedValue({});
    prismaMock.classes.findUnique.mockResolvedValue({id: 1, show_id: 1});
    prismaMock.shows_Packages.findFirst.mockResolvedValue({id: 1});
    prismaMock.packages.findFirst.
        mockResolvedValue({price: 100, stalls: 1, tack_stalls: 1});

    const response = await api
        .post('/api/shows/1/classes/1/inscriptions')
        .set('Authorization', `${await jwtUser1()}`)
        .send(inscription);
    expect(response.statusCode).toBe(201);
  });

  test('responds with missing field', async () => {
    prismaMock.inscriptions.create.mockRejectedValueOnce(
        new Error('Mocked error for testing purposes'),
    );

    const response = await api
        .post('/api/shows/1/classes/1/inscriptions')
        .set('Authorization', `${await jwtUser1()}`)
        .send({
          rider_id: 1,
          no_fei: '58675786',
          nb_stalls: 2,
          nb_chiving_bags: 2,
        });
    expect(response).toHaveProperty('error');
  });

  test('test validation isNbDayWithNbStallOrStack', async () => {
    const inscription = {
      horse_id: 1,
      rider_id: 1,
      no_fei: '58675786',
      nb_stalls: 1,
      nb_tack_stalls: 2,
      nb_hay_bale: 2,
      nb_chiving_bags: 2,
      show_asked_codes: null,
      nb_days: 0,
      Shows_Packages: [
        {id: 1, count: 2},
      ],
    };

    const response = await api
        .post('/api/shows/1/classes/1/inscriptions')
        .set('Authorization', `${await jwtUser1()}`)
        .send(inscription);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('The number of days' +

        ' and the number of stalls or tack stalls need to either be both 0 '+

        'or both more than 0');
  });


  test('test validation is show published', async () => {
    const inscription = {
      horse_id: 1,
      rider_id: 1,
      no_fei: '58675786',
      nb_stalls: 1,
      nb_tack_stalls: 2,
      nb_hay_bale: 2,
      nb_chiving_bags: 2,
      show_asked_codes: null,
      nb_days: 1,
      Shows_Packages: [
        {id: 1, count: 2},
      ],
    };
    prismaMock.shows.findUnique.mockResolvedValue({is_published: false});
    prismaMock.horses.findUnique.mockResolvedValue({id: 1});
    prismaMock.riders.findUnique.mockResolvedValue({id: 1});

    const response = await api
        .post('/api/shows/1/classes/1/inscriptions')
        .set('Authorization', `${await jwtUser1()}`)
        .send(inscription);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Show is not published');
  });

  test('test validation is show is within the test limit', async () => {
    const inscription = {
      horse_id: 1,
      rider_id: 1,
      no_fei: '58675786',
      nb_stalls: 1,
      nb_tack_stalls: 2,
      nb_hay_bale: 2,
      nb_chiving_bags: 2,
      show_asked_codes: null,
      nb_days: 100,
      Shows_Packages: [
        {id: 1, count: 2},
      ],
    };
    prismaMock.shows.findUnique.mockResolvedValue({
      is_published: true,
      start_date: '2024-05-18',
      end_date: '2024-05-20'});
    prismaMock.horses.findUnique.mockResolvedValue({id: 1});
    prismaMock.riders.findUnique.mockResolvedValue({id: 1});

    const response = await api
        .post('/api/shows/1/classes/1/inscriptions')
        .set('Authorization', `${await jwtUser1()}`)
        .send(inscription);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('The number of days is greater' +
    ' than the show duration');
  });

  test('test validation class is within the show', async () => {
    const inscription = {
      horse_id: 1,
      rider_id: 1,
      no_fei: '58675786',
      nb_stalls: 1,
      nb_tack_stalls: 2,
      nb_hay_bale: 2,
      nb_chiving_bags: 2,
      show_asked_codes: null,
      nb_days: 3,
      Shows_Packages: [
        {id: 1, count: 2},
      ],
    };
    prismaMock.shows.findUnique.mockResolvedValue({
      is_published: true,
      start_date: '2024-05-18',
      end_date: '2024-05-22'});
    prismaMock.horses.findUnique.mockResolvedValue({id: 1});
    prismaMock.riders.findUnique.mockResolvedValue({id: 1});
    prismaMock.classes.findUnique.mockResolvedValue({id: 1, show_id: 2});

    const response = await api
        .post('/api/shows/1/classes/1/inscriptions')
        .set('Authorization', `${await jwtUser1()}`)
        .send(inscription);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('The show does not own the classe');
  });

  test('test validation that the bundle is unique', async () => {
    const inscription = {
      horse_id: 1,
      rider_id: 1,
      no_fei: '58675786',
      nb_stalls: 1,
      nb_tack_stalls: 2,
      nb_hay_bale: 2,
      nb_chiving_bags: 2,
      show_asked_codes: null,
      nb_days: 3,
      Shows_Packages: [
        {id: 1, count: 2},
        {id: 1, count: 4},
      ],
    };
    prismaMock.shows.findUnique.mockResolvedValue({
      is_published: true,
      start_date: '2024-05-18',
      end_date: '2024-05-22',
      inscription_start_date: '2022-05-15',
      inscription_end_date: '2030-05-20'});
    prismaMock.horses.findUnique.mockResolvedValue({id: 1});
    prismaMock.riders.findUnique.mockResolvedValue({id: 1});
    prismaMock.classes.findUnique.mockResolvedValue({id: 1, show_id: 1});

    const response = await api
        .post('/api/shows/1/classes/1/inscriptions')
        .set('Authorization', `${await jwtUser1()}`)
        .send(inscription);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Bundle id are not unique');
  });

  test('test validation that the bundle in the array exist', async () => {
    const inscription = {
      horse_id: 1,
      rider_id: 1,
      no_fei: '58675786',
      nb_stalls: 1,
      nb_tack_stalls: 2,
      nb_hay_bale: 2,
      nb_chiving_bags: 2,
      show_asked_codes: null,
      nb_days: 3,
      Shows_Packages: [
        {id: 1, count: 2},
      ],
    };
    prismaMock.shows.findUnique.mockResolvedValue({
      is_published: true,
      start_date: '2024-05-18',
      end_date: '2024-05-22',
      inscription_start_date: '2022-05-15',
      inscription_end_date: '2030-05-20'});
    prismaMock.horses.findUnique.mockResolvedValue({id: 1});
    prismaMock.riders.findUnique.mockResolvedValue({id: 1});
    prismaMock.classes.findUnique.mockResolvedValue({id: 1, show_id: 1});
    prismaMock.shows_Packages.findFirst.mockResolvedValue();

    const response = await api
        .post('/api/shows/1/classes/1/inscriptions')
        .set('Authorization', `${await jwtUser1()}`)
        .send(inscription);
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Bundle id with show id not found');
  });
});

describe('PATCH shows/:id/classes/:id/inscriptions/:id', function() {
  test('responds with updated inscription', async () => {
    prismaMock.classes.findUnique.mockResolvedValue({id: 1});
    prismaMock.shows.findUnique.mockResolvedValue({id: 1, organizer_id: 1});
    prismaMock.inscriptions.findUnique.mockResolvedValue({approved: false});
    prismaMock.inscriptions.update.mockResolvedValue({approved: true});

    const response = await api
        .patch('/api/shows/1/classes/1/inscriptions/1')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .send({approved: true});
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /users/:userid/inscriptions', function() {
  test('responds with inscriptions', async () => {
    const inscription = {
      horse_id: 1,
      rider_id: 1,
      no_fei: '58675786',
      nb_stalls: 2,
      nb_hay_bale: 2,
      nb_chiving_bags: 2,
    };

    const mockedShow = {
      id: 1,
      name: 'test',
      address: {
        id: 1,
      },
      nb_total_place: 10,
      nb_free_place: 10,
      nb_temp_stalls: 10,
      nb_tack_stalls: 10,
      nb_free_temp_stalls: 10,
      nb_free_tack_stalls: 10,
      nb_free_permanent_stalls: 10,
      nb_permanent_stalls: 10,
      recognized_show: true,
      rules: 'no rules haha',
      start_date: '2024-05-25',
      end_date: '2024-05-26',
      can_have_late_registration: true,
      inscription_end_date: '2024-05-20',
      inscription_end_late_date: '2024-05-24',
      inscription_start_date: '2024-01-15',
      administration: 2500,
      late_inscription: 2500,
      cancel_inscription: 5000,
      ground: 1000,
      paramedics: 12000,
      camper_ground_rental: 4000,
      asked_codes: 'fei_canada,fei_quebec',
      hay: 1000,
      chiving: 2000,
      temp_stall_per_day: 6000,
      permanent_stall_per_day: 14000,
      tack_stall_per_day: 8000,
      drug_test: 3500,
    };
    const address = {
      street_address: '123 rue de la paix',
      province: 'Ile de France',
      country: 'France',
      city: 'Paris',
      zip_code: 'B2A3B4',
      other_information: 'some other',
    };
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
    const rider = {
      name: 'test',
      phone: '4505554444',
      email: 'test@email.com',
      no_fei: '58675786',
      emergency_name: 'michel michaud',
      emergency_phone: '5140005555',
      stable_name: 'michmich',
      trainer_name: 'Seb DJ',
    };
    prismaMock.inscriptions.findMany.mockResolvedValue([inscription]);
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);
    prismaMock.address.findUnique.mockResolvedValue(address);
    prismaMock.horses.findUnique.mockResolvedValue(horse);
    prismaMock.riders.findFirst.mockResolvedValue(rider);
    prismaMock.users.findUnique.mockResolvedValue({name: 'John Doe'});
    prismaMock.classes_Inscriptions.findFirst.mockResolvedValue(
        {class_name: 'test'},
    );
    const response = await api.get('/api/users/1/inscriptions')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response.statusCode).toEqual(200);

    prismaMock.inscriptions.findMany.mockResolvedValue();
    const response2 = await api.get('/api/users/1/inscriptions')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response2.statusCode).toEqual(204);
  });
});

describe('GET inscription by id', function() {
  test('responds with inscription', async () => {
    const inscription = {
      horse_id: 1,
      rider_id: 1,
      no_fei: '58675786',
      nb_stalls: 2,
      nb_hay_bale: 2,
      nb_chiving_bags: 2,
      user_id: 1,
    };

    const mockedShow = {
      id: 1,
      name: 'test',
      address: {
        id: 1,
      },
      nb_total_place: 10,
      nb_free_place: 10,
      nb_temp_stalls: 10,
      nb_tack_stalls: 10,
      nb_free_temp_stalls: 10,
      nb_free_tack_stalls: 10,
      nb_free_permanent_stalls: 10,
      nb_permanent_stalls: 10,
      recognized_show: true,
      rules: 'no rules haha',
      start_date: '2024-05-25',
      end_date: '2024-05-26',
      can_have_late_registration: true,
      inscription_end_date: '2024-05-20',
      inscription_end_late_date: '2024-05-24',
      inscription_start_date: '2024-01-15',
      administration: 2500,
      late_inscription: 2500,
      cancel_inscription: 5000,
      ground: 1000,
      paramedics: 12000,
      camper_ground_rental: 4000,
      asked_codes: 'fei_canada,fei_quebec',
      hay: 1000,
      chiving: 2000,
      temp_stall_per_day: 6000,
      permanent_stall_per_day: 14000,
      tack_stall_per_day: 8000,
      drug_test: 3500,
    };
    const address = {
      street_address: '123 rue de la paix',
      province: 'Ile de France',
      country: 'France',
      city: 'Paris',
      zip_code: 'B2A3B4',
      other_information: 'some other',
    };
    const horse = {
      name: 'Pale',
      path_vaccine: 'src/public/documents/test-image.jpg',
      path_coggins: 'src/public/documents/test-image.jpg',
    };
    const rider = {
      name: 'test',
    };
    prismaMock.classes.findUnique.mockResolvedValue({id: 1});
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);
    prismaMock.users.findUnique.mockResolvedValue({id: 1});
    prismaMock.inscriptions.findUnique.mockResolvedValue(inscription);
    prismaMock.inscriptions.findUnique.mockResolvedValue(inscription);
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);
    prismaMock.address.findUnique.mockResolvedValue(address);
    prismaMock.horses.findUnique.mockResolvedValue(horse);
    prismaMock.riders.findFirst.mockResolvedValue(rider);
    prismaMock.classes_Inscriptions.findFirst.mockResolvedValue(
        {class_name: 'test'},
    );
    const response = await api.get('/api/shows/1/classes/1/inscriptions/1')
        .set('Authorization', `${await jwtUser1()}`);
    expect(response.statusCode).toEqual(200);
  });
});


describe('GET detailed receipt', function() {
  test('responds with detailed receipt', async () => {
    const inscriptionMock = {
      id: 1,
      horse_id: 1,
      rider_id: 1,
      show_id: 1,
      user_id: 3,
      no_fei: 'FEI123',
      nb_stalls: 2,
      nb_tack_stalls: 1,
      nb_hay_bale: 5,
      nb_chiving_bags: 3,
      stall_type: 'PERMANENT',
      nb_days: 2,
      total: 100,
      has_payed: false,
      invoice_number: null,
      approved: false,
      rider_entry_number: 1,
      createdAt: '2024-02-27T18:01:00.540Z',
      updatedAt: '2024-02-27T18:01:00.540Z',
      rider: {name: 'Jane Doe'},
      horse: {name: 'Thunder'},
      show: {
        id: 1,
        name: 'Show 1',
        address_id: 1,
        organizer_id: 2,
        path_logo: null,
        nb_total_place: 101,
        nb_free_place: 45,
        nb_temp_stalls: 10,
        nb_permanent_stalls: 8,
        nb_tack_stalls: 15,
        nb_free_temp_stalls: 10,
        nb_free_permanent_stalls: 14,
        nb_free_tack_stalls: 24,
        show_fee_id: 1,
        administration_fee_id: 1,
        recognized_show: false,
        rules: 'Hello I am the rules!',
        start_date: '2024-07-21T16:50:58.927Z',
        inscription_start_date: '2024-09-22T05:24:34.650Z',
        inscription_end_date: '2024-02-26T18:01:00.540Z',
        inscription_end_late_date: null,
        is_vaccination_proof_required: true,
        is_coggins_proof_required: false,
        end_date: '2026-05-03T12:02:14.636Z',
        is_published: false,
        secretary_id: 3,
        createdAt: '2024-02-27T18:01:00.048Z',
        updatedAt: '2024-02-27T18:01:00.048Z',
        address: {
          id: 1,
          street_address: '123 Main Street',
          province: 'Quebec',
          country: 'Canada',
          city: 'Montreal',
          zip_code: '12345',
          other_information: null,
          organizer_id: 4,
          createdAt: '2024-02-27T18:01:00.033Z',
          updatedAt: '2024-02-27T18:01:00.033Z',
        },
        administration_fee: {
          id: 1,
          administration: 100,
          late_inscription: 20,
          cancel_inscription: 30,
          ground: 50,
          paramedics: 10,
          camper_ground_rental: 15,
          createdAt: '2024-02-27T18:01:00.045Z',
          updatedAt: '2024-02-27T18:01:00.045Z',
        },
        show_fees: {
          id: 1,
          hay: 50,
          chiving: 30,
          temp_stall_per_day: 10,
          permanent_stall_per_day: 15,
          tack_stall_per_day: 5,
          drug_test: 20,
          createdAt: '2024-02-27T18:01:00.040Z',
          updatedAt: '2024-02-27T18:01:00.040Z',
        },
        secretary: {
          id: 3,
          is_verified: false,
          is_active: true,
          name: 'Astarion Ancunin',
          email: 'secretary@email.com',
          phone: '123-987-1231',
          password:
          '$2a$10$naLY.BK.uS9Z5ESvvoCwqOhQP.qZzc8/044B8Y2FyA7tTf76tnT0O',
          birthdate: '1990-01-01T00:00:00.000Z',
          role: 'SECRETARY',
          createdAt: '2024-02-27T18:00:59.948Z',
          updatedAt: '2024-02-27T18:00:59.948Z',
        },
      },
      Classes_Inscriptions: {
        id: 1,
        class_id: 1,
        inscription_id: 1,
        createdAt: '2024-02-27T18:01:00.561Z',
        updatedAt: '2024-02-27T18:01:00.561Z',
        class: {
          id: 1,
          number: 'Alloa',
          name: 'Jumping Class A',
          date: '2024-02-01T10:00:00.000Z',
          ring_name: 'Bell Center',
          ring_number: '12AB',
          price_entry: 50,
          show_id: 1,
          test_id: 1,
          level_type: 'Training',
          is_test_of_choice: false,
          createdAt: '2024-02-27T18:01:00.499Z',
          updatedAt: '2024-02-27T18:01:00.499Z',
          test: [],
        },
      },
      Inscriptions_Packages: [
        {
          id: 1,
          inscription_id: 1,
          package_id: 1,
          nb_packages: 1,
          createdAt: '2024-02-27T18:01:00.598Z',
          updatedAt: '2024-02-27T18:01:00.598Z',
          package: [],
        },
      ],
    };


    prismaMock.users.findUnique.mockResolvedValue({id: 1});
    prismaMock.inscriptions.findUnique.mockResolvedValue(inscriptionMock);

    const response = await api.get('/api/users/1/inscriptions/1/receipt')
        .set('Authorization', `${await jwtAdmin1()}`);
    expect(response.statusCode).toEqual(200);
  });
});
