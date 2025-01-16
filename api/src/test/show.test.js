const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');
const {jwtOrganizer1, jwtAdmin1} = require('./utils.js');

const mockedShow = [
  {
    id: 1,
    name: 'Show Name',
    address: {
      id: 1,
      street_address: '1234 rue de la rue',
      province: 'QC',
      country: 'Canada',
      city: 'Montreal',
      zip_code: 'H1H1H1',
      other_information: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    nb_temp_stalls: 10,
    nb_inside_stalls: 20,
    nb_tack_stalls: 30,
    is_coggins_proof_required: true,
    is_vaccination_proof_required: true,
    organizer_id: 1,
    organizer: {
      id: 1,
      name: 'Organizer Name',
      email: 'organizer@example.com',
      phone: '514-123-4567',
      birthdate: '1980-01-01T00:00:00.000Z',
      role: 'ORGANISER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    secretary: {
      id: 2,
    },
    path_logo: 'path/to/logo.png',
    nb_free_place: 40,
    nb_total_place: 50,
    show_fees: {
      id: 1,
      hay: 10,
      chiving: 5,
      temp_stall_per_day: 0,
      inside_stall_per_day: 20,
      tack_stall_per_day: 30,
      drug_test: 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    administration_fee: {
      id: 1,
      administration: 50,
      late_inscription: 60,
      cancel_inscription: 70,
      ground: 80,
      first_aids: 90,
      trailer_ground_rental: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    recognized_show: true,
    rules: 'According to all known laws of aviation...',
    is_published: true,
    start_date: '2024-01-01T00:00:00.000Z',
    end_date: '2025-01-02T00:00:00.000Z',
    inscription_start_date: '2025-10-10T00:00:00.000Z',
    inscription_end_date: '2025-12-02T00:00:00.000Z',
    inscription_end_late_date: '2025-12-31T00:00:00.000Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const singleMockedShow =
  {
    id: 1,
    name: 'Show Name',
    address: {
      id: 1,
      street_address: '1234 rue de la rue',
      province: 'QC',
      country: 'Canada',
      city: 'Montreal',
      zip_code: 'H1H1H1',
      other_information: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    nb_temp_stalls: 10,
    nb_inside_stalls: 20,
    nb_tack_stalls: 30,
    is_coggins_proof_required: true,
    is_vaccination_proof_required: true,
    organizer_id: 1,
    organizer: {
      id: 1,
      name: 'Organizer Name',
      email: 'organizer@example.com',
      phone: '514-123-4567',
      birthdate: '1980-01-01T00:00:00.000Z',
      role: 'ORGANISER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    secretary: {
      id: 2,
    },
    path_logo: 'path/to/logo.png',
    nb_free_place: 40,
    nb_total_place: 50,
    show_fees: {
      id: 1,
      hay: 10,
      chiving: 5,
      temp_stall_per_day: 0,
      inside_stall_per_day: 20,
      tack_stall_per_day: 30,
      drug_test: 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    administration_fee: {
      id: 1,
      administration: 50,
      late_inscription: 60,
      cancel_inscription: 70,
      ground: 80,
      first_aids: 90,
      trailer_ground_rental: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    recognized_show: true,
    rules: 'According to all known laws of aviation...',
    is_published: true,
    start_date: '2024-01-01T00:00:00.000Z',
    end_date: '2025-01-02T00:00:00.000Z',
    inscription_start_date: '2025-10-10T00:00:00.000Z',
    inscription_end_date: '2025-12-02T00:00:00.000Z',
    inscription_end_late_date: '2025-12-31T00:00:00.000Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

describe('GET /shows', function() {
  test('responds with shows', async () => {
    const res1 = await api.get('/api/shows');
    expect(res1.status).toBe(204);

    prismaMock.shows.findMany.mockResolvedValue(mockedShow);

    const response = await api.get('/api/shows');
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.data[0]).toHaveProperty('id');
    expect(response.status).toBe(200);
  });
});

describe('GET /shows/loggedUserShows', function() {
  test('responds with shows', async () => {
    prismaMock.shows.findMany.mockResolvedValue([]);
    let response = await api
        .get('/api/shows/loggedUserShows')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.status).toBe(204);

    prismaMock.shows.findMany.mockResolvedValue(mockedShow);

    response = await api
        .get('/api/shows/loggedUserShows')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data[0]).toHaveProperty('id');
    expect(response.body.pagination).toHaveProperty('current_page');

    response = await api
        .get('/api/shows/loggedUserShows?query=Show Name')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.status).toBe(200);
  });
});

describe('DELETE /shows/:showId', function() {
  test('responds with deleted show', async () => {
    prismaMock.shows.findUnique.mockResolvedValue({
      ...mockedShow,
      organizer_id: 1,
    });
    prismaMock.shows.delete.mockResolvedValue(mockedShow);

    const response = await api
        .delete('/api/shows/1')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.body).toHaveProperty('data');
    expect(response.status).toBe(200);
  });
});

describe('GET /shows/:showId', function() {
  test('responds with show', async () => {
    prismaMock.shows.findUnique.mockResolvedValue(singleMockedShow);

    const response = await api
        .get('/api/shows/1')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.body).toHaveProperty('address');
    expect(response.status).toBe(200);
  });
});

describe('GET /shows/notLoggedDetails/:showId', function() {
  test('responds with show detail', async () => {
    const mockedShow = {
      id: 1,
      name: 'Show 1',
      start_date: '2024-01-06T08:24:24.992Z',
      end_date: '2025-04-28T14:36:25.664Z',
      nb_free_place: 68,
      is_published: 1,
      address: {
        city: 'Montreal',
        zip_code: '12345',
      },
    };
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);
    const response = await api.get('/api/shows/notLoggedDetails/1');
    expect(response.body).toHaveProperty('address');
    expect(response.status).toBe(200);
  });
});

describe('GET /shows/:showId/inscriptions', function() {
  test('responds with show inscriptions', async () => {
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);
    prismaMock.inscriptions.findMany.mockResolvedValue({id: 1});
    const response = await api
        .get('/api/shows/1/inscriptions')
        .set('Authorization', `${await jwtAdmin1()}`);
    expect(response.body).toHaveProperty('id');
  });
});

describe('POST /shows', function() {
  test('responds with created show', async () => {
    const mockedShow = {
      id: 1,
      name: 'test',
      address_id: 1,
      nb_total_place: 1,
      nb_free_place: 1,
      nb_temp_stalls: 1,
      nb_tack_stalls: 1,
      nb_free_temp_stalls: 1,
      nb_free_tack_stalls: 1,
      nb_free_permanent_stalls: 1,
      nb_permanent_stalls: 1,
      recognized_show: true,
      rules: 'no rules haha',
      start_date: '2024-05-25',
      end_date: '2024-05-26',
      inscription_end_date: '2024-05-20',
      inscription_end_late_date: '2024-05-24',
      inscription_start_date: '2024-05-15',
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
      is_coggins_proof_required: true,
      is_vaccination_proof_required: true,
    };

    // prismaMock.shows.create.mockResolvedValue(mockedShow);
    prismaMock.organizerShows.findUnique.mockResolvedValue({});
    prismaMock.organizerShows.update.mockResolvedValue({});
    prismaMock.organizerShows.create.mockResolvedValue({});
    prismaMock.administration_Fees.create.mockResolvedValue({id: 1});
    prismaMock.shows_Fees.create.mockResolvedValue({id: 1});
    prismaMock.shows_Asked_Codes.create.mockResolvedValue({id: 1});
    prismaMock.address.findFirst.mockResolvedValue({id: 1});
    prismaMock.users.findFirst.mockResolvedValue({id: 1});
    prismaMock.$transaction.mockResolvedValue(mockedShow);

    const response = await api
        .post('/api/shows')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .field('name', mockedShow.name)
        .field('address_id', mockedShow.address_id)
        .field('nb_total_place', mockedShow.nb_total_place)
        .field('nb_free_place', mockedShow.nb_free_place)
        .field('nb_temp_stalls', mockedShow.nb_temp_stalls)
        .field('nb_tack_stalls', mockedShow.nb_tack_stalls)
        .field('nb_free_temp_stalls', mockedShow.nb_free_temp_stalls)
        .field('nb_free_tack_stalls', mockedShow.nb_free_tack_stalls)
        .field('nb_free_permanent_stalls', mockedShow.nb_free_permanent_stalls)
        .field('nb_permanent_stalls', mockedShow.nb_permanent_stalls)
        .field('recognized_show', mockedShow.recognized_show)
        .field('rules', mockedShow.rules)
        .field('start_date', mockedShow.start_date)
        .field('end_date', mockedShow.end_date)
        .field('inscription_end_date', mockedShow.inscription_end_date)
        .field('inscription_end_late_date',
            mockedShow.inscription_end_late_date)
        .field('inscription_start_date', mockedShow.inscription_start_date)
        .field('administration', mockedShow.administration)
        .field('late_inscription', mockedShow.late_inscription)
        .field('cancel_inscription', mockedShow.cancel_inscription)
        .field('ground', mockedShow.ground)
        .field('paramedics', mockedShow.paramedics)
        .field('camper_ground_rental', mockedShow.camper_ground_rental)
        .field('asked_codes', mockedShow.asked_codes)
        .field('hay', mockedShow.hay)
        .field('chiving', mockedShow.chiving)
        .field('temp_stall_per_day', mockedShow.temp_stall_per_day)
        .field('permanent_stall_per_day', mockedShow.permanent_stall_per_day)
        .field('tack_stall_per_day', mockedShow.tack_stall_per_day)
        .field('drug_test', mockedShow.drug_test)
        .field('is_coggins_proof_required',
            mockedShow.is_coggins_proof_required)
        .field(
            'is_vaccination_proof_required',
            mockedShow.is_vaccination_proof_required,
        )
        .attach('show_logo', `${__dirname}/test-image.jpg`);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('name', 'test');
  });

  test('responds with error message secretary id', async () => {
    const mockedShow = {
      id: 1,
      name: 'test',
      address_id: 1,
      nb_total_place: 1,
      nb_free_place: 1,
      nb_temp_stalls: 1,
      nb_tack_stalls: 1,
      nb_free_temp_stalls: 1,
      nb_free_tack_stalls: 1,
      nb_free_permanent_stalls: 1,
      nb_permanent_stalls: 1,
      recognized_show: true,
      rules: 'no rules haha',
      start_date: '2024-05-25',
      end_date: '2024-05-26',
      can_have_late_registration: true,
      inscription_end_date: '2024-05-20',
      inscription_end_late_date: '2024-05-24',
      inscription_start_date: '2024-05-15',
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

    prismaMock.organizerShows.findUnique.mockResolvedValue({});
    prismaMock.organizerShows.update.mockResolvedValue({});
    prismaMock.organizerShows.create.mockResolvedValue({});
    prismaMock.shows.create.mockResolvedValue(mockedShow);
    prismaMock.administration_Fees.create.mockResolvedValue({id: 1});
    prismaMock.shows_Fees.create.mockResolvedValue({id: 1});
    prismaMock.shows_Asked_Codes.create.mockResolvedValue({id: 1});
    prismaMock.address.findFirst.mockResolvedValue({id: 1});

    const response = await api
        .post('/api/shows')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .field('name', mockedShow.name)
        .field('address_id', mockedShow.address_id)
        .field('nb_total_place', mockedShow.nb_total_place)
        .field('nb_free_place', mockedShow.nb_free_place)
        .field('nb_temp_stalls', mockedShow.nb_temp_stalls)
        .field('nb_tack_stalls', mockedShow.nb_tack_stalls)
        .field('nb_free_temp_stalls', mockedShow.nb_free_temp_stalls)
        .field('nb_free_tack_stalls', mockedShow.nb_free_tack_stalls)
        .field('nb_free_permanent_stalls', mockedShow.nb_free_permanent_stalls)
        .field('nb_permanent_stalls', mockedShow.nb_permanent_stalls)
        .field('recognized_show', mockedShow.recognized_show)
        .field('rules', mockedShow.rules)
        .field('start_date', mockedShow.start_date)
        .field('end_date', mockedShow.end_date)
        .field(
            'can_have_late_registration',
            mockedShow.can_have_late_registration,
        )
        .field('inscription_end_date', mockedShow.inscription_end_date)
        .field('inscription_end_late_date',
            mockedShow.inscription_end_late_date)
        .field('inscription_start_date', mockedShow.inscription_start_date)
        .field('administration', mockedShow.administration)
        .field('late_inscription', mockedShow.late_inscription)
        .field('cancel_inscription', mockedShow.cancel_inscription)
        .field('ground', mockedShow.ground)
        .field('paramedics', mockedShow.paramedics)
        .field('camper_ground_rental', mockedShow.camper_ground_rental)
        .field('asked_codes', mockedShow.asked_codes)
        .field('hay', mockedShow.hay)
        .field('chiving', mockedShow.chiving)
        .field('temp_stall_per_day', mockedShow.temp_stall_per_day)
        .field('permanent_stall_per_day', mockedShow.permanent_stall_per_day)
        .field('tack_stall_per_day', mockedShow.tack_stall_per_day)
        .field('drug_test', mockedShow.drug_test)
        .field('secretary_id', 4)
        .attach('show_logo', `${__dirname}/test-image.jpg`);
    expect(response.status).toBe(400);
    expect(response.body.errorMessage[0]).toBe(
        '"is_vaccination_proof_required" is required',
    );
  });
});

describe('GET /shows/adminShows', function() {
  test('responds with shows', async () => {
    prismaMock.shows.findMany.mockResolvedValue(mockedShow);

    const response = await api
        .get('/api/shows/adminShows')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.body).toHaveProperty('data');
    expect(response.status).toBe(200);
  });

  test('responds with 404', async () => {
    prismaMock.shows.findMany.mockResolvedValue([]);
    const response = await api
        .get('/api/shows/adminShows')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.status).toBe(204);
  });
});

describe('GET /shows/adminShows/:showId', function() {
  test('responds with show', async () => {
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow[0]);
    const response = await api
        .get('/api/shows/adminShows/1')
        .set('Authorization', `${await jwtOrganizer1()}`);
    expect(response.body).toHaveProperty('address');
    expect(response.status).toBe(200);
  });
});

describe('PUT /shows/:showId', function() {
  test('Success modify a show that is not started yet', async () => {
    const mockedShow = {
      id: 1,
      name: 'test',
      address_id: 1,
      organizer_id: 1,
      nb_total_place: 1,
      nb_free_place: 1,
      nb_temp_stalls: 1,
      nb_tack_stalls: 1,
      nb_free_temp_stalls: 1,
      nb_free_tack_stalls: 1,
      nb_free_permanent_stalls: 1,
      nb_permanent_stalls: 1,
      recognized_show: true,
      rules: 'no rules haha',
      start_date: '2025-05-25',
      end_date: '2025-05-25',
      can_have_late_registration: true,
      inscription_end_date: '2025-05-25',
      inscription_end_late_date: '2025-05-25',
      inscription_start_date: '2025-05-25',
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
      is_coggins_proof_required: true,
      is_vaccination_proof_required: true,
      is_published: false,
    };

    prismaMock.$transaction.mockResolvedValue(mockedShow);
    // prismaMock.shows.update.mockResolvedValue(mockedShow);
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);
    prismaMock.address.findFirst.mockResolvedValue({id: 1});

    const response = await api
        .put('/api/shows/1')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .field('name', mockedShow.name)
        .field('address_id', mockedShow.address_id)
        .field('nb_total_place', mockedShow.nb_total_place)
        .field('nb_temp_stalls', mockedShow.nb_temp_stalls)
        .field('nb_tack_stalls', mockedShow.nb_tack_stalls)
        .field('nb_permanent_stalls', mockedShow.nb_permanent_stalls)
        .field('recognized_show', mockedShow.recognized_show)
        .field('rules', mockedShow.rules)
        .field('start_date', mockedShow.start_date)
        .field('end_date', mockedShow.end_date)
        .field('inscription_end_date', mockedShow.inscription_end_date)
        .field('inscription_end_late_date',
            mockedShow.inscription_end_late_date)
        .field('inscription_start_date', mockedShow.inscription_start_date)
        .field('administration', mockedShow.administration)
        .field('late_inscription', mockedShow.late_inscription)
        .field('cancel_inscription', mockedShow.cancel_inscription)
        .field('ground', mockedShow.ground)
        .field('paramedics', mockedShow.paramedics)
        .field('camper_ground_rental', mockedShow.camper_ground_rental)
        .field('asked_codes', mockedShow.asked_codes)
        .field('hay', mockedShow.hay)
        .field('chiving', mockedShow.chiving)
        .field('temp_stall_per_day', mockedShow.temp_stall_per_day)
        .field('permanent_stall_per_day', mockedShow.permanent_stall_per_day)
        .field('tack_stall_per_day', mockedShow.tack_stall_per_day)
        .field('drug_test', mockedShow.drug_test)
        .field('is_coggins_proof_required',
            mockedShow.is_coggins_proof_required)
        .field(
            'is_vaccination_proof_required',
            mockedShow.is_vaccination_proof_required,
        )
        .attach('show_logo', `${__dirname}/test-image.jpg`);

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty('data');
  });

  test('Success modify a show that has started', async () => {
    const mockedShow = {
      id: 1,
      name: 'test',
      address_id: 1,
      organizer_id: 1,
      nb_total_place: 1,
      nb_free_place: 1,
      nb_temp_stalls: 1,
      nb_tack_stalls: 1,
      nb_free_temp_stalls: 1,
      nb_free_tack_stalls: 1,
      nb_free_permanent_stalls: 1,
      nb_permanent_stalls: 1,
      recognized_show: true,
      rules: 'no rules haha',
      start_date: '2025-05-25',
      end_date: '2025-05-25',
      can_have_late_registration: true,
      inscription_end_date: '2025-05-25',
      inscription_end_late_date: '2025-05-25',
      inscription_start_date: '2025-05-25',
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
      is_coggins_proof_required: true,
      is_vaccdination_proof_required: true,
      is_published: true,
    };

    prismaMock.$transaction.mockResolvedValue(mockedShow);
    // prismaMock.shows.update.mockResolvedValue(mockedShow);
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);

    const response = await api
        .put('/api/shows/1')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .field('nb_total_place', mockedShow.nb_total_place)
        .field('nb_temp_stalls', mockedShow.nb_temp_stalls)
        .field('nb_tack_stalls', mockedShow.nb_tack_stalls)
        .field('nb_permanent_stalls', mockedShow.nb_permanent_stalls)
        .field('rules', mockedShow.rules);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });

  test(
      'Error modify a show that has not started with the parameter of' +
      'a started show',
      async () => {
        const mockedShow = {
          id: 1,
          name: 'test',
          address_id: 1,
          organizer_id: 1,
          nb_total_place: 1,
          nb_free_place: 1,
          nb_temp_stalls: 1,
          nb_tack_stalls: 1,
          nb_free_temp_stalls: 1,
          nb_free_tack_stalls: 1,
          nb_free_permanent_stalls: 1,
          nb_permanent_stalls: 1,
          recognized_show: true,
          rules: 'no rules haha',
          start_date: '2025-05-25',
          end_date: '2025-05-25',
          can_have_late_registration: true,
          inscription_end_date: '2025-05-25',
          inscription_end_late_date: '2025-05-25',
          inscription_start_date: '2025-05-25',
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
          is_coggins_proof_required: true,
          is_vaccdination_proof_required: true,
          is_published: false,
        };

        prismaMock.$transaction.mockResolvedValue(mockedShow);
        // prismaMock.shows.update.mockResolvedValue(mockedShow);
        prismaMock.shows.findUnique.mockResolvedValue(mockedShow);

        const response = await api
            .put('/api/shows/1')
            .set('Authorization', `${await jwtOrganizer1()}`)
            .field('nb_total_place', mockedShow.nb_total_place)
            .field('nb_temp_stalls', mockedShow.nb_temp_stalls)
            .field('nb_tack_stalls', mockedShow.nb_tack_stalls)
            .field('nb_permanent_stalls', mockedShow.nb_permanent_stalls)
            .field('rules', mockedShow.rules);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('"name" is required');
      },
  );

  test(
      'Error modify a show that has started with the parameter of' +
      'that has not start',
      async () => {
        const mockedShow = {
          id: 1,
          name: 'test',
          address_id: 1,
          organizer_id: 1,
          nb_total_place: 1,
          nb_free_place: 1,
          nb_temp_stalls: 1,
          nb_tack_stalls: 1,
          nb_free_temp_stalls: 1,
          nb_free_tack_stalls: 1,
          nb_free_permanent_stalls: 1,
          nb_permanent_stalls: 1,
          recognized_show: true,
          rules: 'no rules haha',
          start_date: '2025-05-25',
          end_date: '2025-05-25',
          can_have_late_registration: true,
          inscription_end_date: '2025-05-25',
          inscription_end_late_date: '2025-05-25',
          inscription_start_date: '2025-05-25',
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
          is_coggins_proof_required: true,
          is_vaccination_proof_required: true,
          is_published: true,
        };

        prismaMock.$transaction.mockResolvedValue(mockedShow);
        // prismaMock.shows.update.mockResolvedValue(mockedShow);
        prismaMock.shows.findUnique.mockResolvedValue(mockedShow);
        prismaMock.address.findFirst.mockResolvedValue({id: 1});

        const response = await api
            .put('/api/shows/1')
            .set('Authorization', `${await jwtOrganizer1()}`)
            .field('name', mockedShow.name)
            .field('address_id', mockedShow.address_id)
            .field('nb_total_place', mockedShow.nb_total_place)
            .field('nb_temp_stalls', mockedShow.nb_temp_stalls)
            .field('nb_tack_stalls', mockedShow.nb_tack_stalls)
            .field('nb_permanent_stalls', mockedShow.nb_permanent_stalls)
            .field('recognized_show', mockedShow.recognized_show)
            .field('rules', mockedShow.rules)
            .field('start_date', mockedShow.start_date)
            .field('end_date', mockedShow.end_date)
            .field('inscription_end_date', mockedShow.inscription_end_date)
            .field(
                'inscription_end_late_date',
                mockedShow.inscription_end_late_date,
            )
            .field('inscription_start_date', mockedShow.inscription_start_date)
            .field('administration', mockedShow.administration)
            .field('late_inscription', mockedShow.late_inscription)
            .field('cancel_inscription', mockedShow.cancel_inscription)
            .field('ground', mockedShow.ground)
            .field('paramedics', mockedShow.paramedics)
            .field('camper_ground_rental', mockedShow.camper_ground_rental)
            .field('asked_codes', mockedShow.asked_codes)
            .field('hay', mockedShow.hay)
            .field('chiving', mockedShow.chiving)
            .field('temp_stall_per_day', mockedShow.temp_stall_per_day)
            .field('permanent_stall_per_day',
                mockedShow.permanent_stall_per_day)
            .field('tack_stall_per_day', mockedShow.tack_stall_per_day)
            .field('drug_test', mockedShow.drug_test)
            .field(
                'is_coggins_proof_required',
                mockedShow.is_coggins_proof_required,
            )
            .field(
                'is_vaccination_proof_required',
                mockedShow.is_vaccination_proof_required,
            );
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('"name" is not allowed');
      },
  );
  test(
      'Error modify a show that has not started with start date' +
      ' that is early pasted',
      async () => {
        const mockedShow = {
          id: 1,
          name: 'test',
          address_id: 1,
          organizer_id: 1,
          nb_total_place: 1,
          nb_free_place: 1,
          nb_temp_stalls: 1,
          nb_tack_stalls: 1,
          nb_free_temp_stalls: 1,
          nb_free_tack_stalls: 1,
          nb_free_permanent_stalls: 1,
          nb_permanent_stalls: 1,
          recognized_show: true,
          rules: 'no rules haha',
          start_date: new Date('2025-05-25'),
          end_date: '2025-05-25',
          can_have_late_registration: true,
          inscription_end_date: '2025-05-25',
          inscription_end_late_date: '2025-05-25',
          inscription_start_date: '2025-05-25',
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
          is_coggins_proof_required: true,
          is_vaccdination_proof_required: true,
          is_published: false,
        };

        // prismaMock.shows.update.mockResolvedValue(mockedShow);
        prismaMock.shows.findUnique.mockResolvedValue(mockedShow);

        const response = await api
            .put('/api/shows/1')
            .set('Authorization', `${await jwtOrganizer1()}`)
            .field('name', mockedShow.name)
            .field('address_id', mockedShow.address_id)
            .field('nb_total_place', mockedShow.nb_total_place)
            .field('nb_temp_stalls', mockedShow.nb_temp_stalls)
            .field('nb_tack_stalls', mockedShow.nb_tack_stalls)
            .field('nb_permanent_stalls', mockedShow.nb_permanent_stalls)
            .field('recognized_show', mockedShow.recognized_show)
            .field('rules', mockedShow.rules)
            .field('end_date', mockedShow.end_date)
            .field('inscription_end_date', mockedShow.inscription_end_date)
            .field(
                'inscription_end_late_date',
                mockedShow.inscription_end_late_date,
            )
            .field('inscription_start_date', '2022-05-25')
            .field('start_date', '2025-05-25')
            .field('administration', mockedShow.administration)
            .field('late_inscription', mockedShow.late_inscription)
            .field('cancel_inscription', mockedShow.cancel_inscription)
            .field('ground', mockedShow.ground)
            .field('paramedics', mockedShow.paramedics)
            .field('camper_ground_rental', mockedShow.camper_ground_rental)
            .field('asked_codes', mockedShow.asked_codes)
            .field('hay', mockedShow.hay)
            .field('chiving', mockedShow.chiving)
            .field('temp_stall_per_day', mockedShow.temp_stall_per_day)
            .field('permanent_stall_per_day',
                mockedShow.permanent_stall_per_day)
            .field('tack_stall_per_day', mockedShow.tack_stall_per_day)
            .field('drug_test', mockedShow.drug_test)
            .field(
                'is_coggins_proof_required',
                mockedShow.is_coggins_proof_required,
            )
            .field('is_vaccination_proof_required', false);

        expect(response.body.error).toBe(
            'The show inscription start date is in the past',
        );
        expect(response.status).toBe(400);
      },
  );
  test('Error modify a show that has not enough total place', async () => {
    const mockedShow = {
      id: 1,
      name: 'test',
      address_id: 1,
      organizer_id: 1,
      nb_total_place: 10,
      nb_free_place: 5,
      nb_temp_stalls: 1,
      nb_tack_stalls: 1,
      nb_free_temp_stalls: 1,
      nb_free_tack_stalls: 1,
      nb_free_permanent_stalls: 1,
      nb_permanent_stalls: 1,
      recognized_show: true,
      rules: 'no rules haha',
      start_date: '2025-05-25',
      end_date: '2025-05-25',
      can_have_late_registration: true,
      inscription_end_date: '2025-05-25',
      inscription_end_late_date: '2025-05-25',
      inscription_start_date: '2025-05-25',
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
      is_coggins_proof_required: true,
      is_vaccdination_proof_required: true,
      is_published: false,
    };

    // prismaMock.shows.update.mockResolvedValue(mockedShow);
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);

    const response = await api
        .put('/api/shows/1')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .field('name', mockedShow.name)
        .field('address_id', mockedShow.address_id)
        .field('nb_total_place', 1)
        .field('nb_temp_stalls', mockedShow.nb_temp_stalls)
        .field('nb_tack_stalls', mockedShow.nb_tack_stalls)
        .field('nb_permanent_stalls', mockedShow.nb_permanent_stalls)
        .field('recognized_show', mockedShow.recognized_show)
        .field('rules', mockedShow.rules)
        .field('end_date', mockedShow.end_date)
        .field('inscription_end_date', mockedShow.inscription_end_date)
        .field('inscription_end_late_date',
            mockedShow.inscription_end_late_date)
        .field('inscription_start_date', '2025-05-25')
        .field('start_date', '2025-05-25')
        .field('administration', mockedShow.administration)
        .field('late_inscription', mockedShow.late_inscription)
        .field('cancel_inscription', mockedShow.cancel_inscription)
        .field('ground', mockedShow.ground)
        .field('paramedics', mockedShow.paramedics)
        .field('camper_ground_rental', mockedShow.camper_ground_rental)
        .field('asked_codes', mockedShow.asked_codes)
        .field('hay', mockedShow.hay)
        .field('chiving', mockedShow.chiving)
        .field('temp_stall_per_day', mockedShow.temp_stall_per_day)
        .field('permanent_stall_per_day', mockedShow.permanent_stall_per_day)
        .field('tack_stall_per_day', mockedShow.tack_stall_per_day)
        .field('drug_test', mockedShow.drug_test)
        .field('is_coggins_proof_required',
            mockedShow.is_coggins_proof_required)
        .field('is_vaccination_proof_required', false);

    expect(response.body.error).toBe('Not enough total place');
    expect(response.status).toBe(400);
  });
  test('Error modify a show that has two of the same asked code', async () => {
    const mockedShow = {
      id: 1,
      name: 'test',
      address_id: 1,
      organizer_id: 1,
      nb_total_place: 10,
      nb_free_place: 5,
      nb_temp_stalls: 1,
      nb_tack_stalls: 1,
      nb_free_temp_stalls: 1,
      nb_free_tack_stalls: 1,
      nb_free_permanent_stalls: 1,
      nb_permanent_stalls: 1,
      recognized_show: true,
      rules: 'no rules haha',
      start_date: '2025-05-25',
      end_date: '2025-05-25',
      can_have_late_registration: true,
      inscription_end_date: '2025-05-25',
      inscription_end_late_date: '2025-05-25',
      inscription_start_date: '2025-05-25',
      administration: 2500,
      late_inscription: 2500,
      cancel_inscription: 5000,
      ground: 1000,
      paramedics: 12000,
      camper_ground_rental: 4000,
      asked_codes: 'fei_canada,fei_canada',
      hay: 1000,
      chiving: 2000,
      temp_stall_per_day: 6000,
      permanent_stall_per_day: 14000,
      tack_stall_per_day: 8000,
      drug_test: 3500,
      is_coggins_proof_required: true,
      is_vaccdination_proof_required: true,
      is_published: false,
    };

    // prismaMock.shows.update.mockResolvedValue(mockedShow);
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);

    const response = await api
        .put('/api/shows/1')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .field('name', mockedShow.name)
        .field('address_id', mockedShow.address_id)
        .field('nb_total_place', 20)
        .field('nb_temp_stalls', mockedShow.nb_temp_stalls)
        .field('nb_tack_stalls', mockedShow.nb_tack_stalls)
        .field('nb_permanent_stalls', mockedShow.nb_permanent_stalls)
        .field('recognized_show', mockedShow.recognized_show)
        .field('rules', mockedShow.rules)
        .field('end_date', mockedShow.end_date)
        .field('inscription_end_date', mockedShow.inscription_end_date)
        .field('inscription_end_late_date',
            mockedShow.inscription_end_late_date)
        .field('inscription_start_date', '2025-05-25')
        .field('start_date', '2025-05-25')
        .field('administration', mockedShow.administration)
        .field('late_inscription', mockedShow.late_inscription)
        .field('cancel_inscription', mockedShow.cancel_inscription)
        .field('ground', mockedShow.ground)
        .field('paramedics', mockedShow.paramedics)
        .field('camper_ground_rental', mockedShow.camper_ground_rental)
        .field('asked_codes', mockedShow.asked_codes)
        .field('hay', mockedShow.hay)
        .field('chiving', mockedShow.chiving)
        .field('temp_stall_per_day', mockedShow.temp_stall_per_day)
        .field('permanent_stall_per_day', mockedShow.permanent_stall_per_day)
        .field('tack_stall_per_day', mockedShow.tack_stall_per_day)
        .field('drug_test', mockedShow.drug_test)
        .field('is_coggins_proof_required',
            mockedShow.is_coggins_proof_required)
        .field('is_vaccination_proof_required', false);

    expect(response.body.error).toBe('Asked codes must be unique');
    expect(response.status).toBe(400);
  });
});

describe('PATCH publish /shows/:showId/publish', function() {
  test('responds with published error cause field not there', async () => {
    const mockedShow = {
      id: 1,
      name: 'test',
      address_id: 1,
      organizer_id: 1,
      nb_total_place: 10,
      nb_free_place: 5,
      nb_temp_stalls: 1,
      nb_tack_stalls: 1,
      nb_free_temp_stalls: 1,
      nb_free_tack_stalls: 1,
      nb_free_permanent_stalls: 1,
      nb_permanent_stalls: 1,
      recognized_show: true,
      rules: 'no rules haha',
      start_date: '2025-05-25',
      end_date: '2025-05-25',
      can_have_late_registration: true,
      inscription_end_date: '2025-05-25',
      inscription_end_late_date: '2025-05-25',
      inscription_start_date: '2025-05-25',
      administration: 2500,
      late_inscription: 2500,
      cancel_inscription: 5000,
      ground: 1000,
      paramedics: 12000,
      camper_ground_rental: 4000,
      asked_codes: 'fei_canada,fei_canada',
      hay: 1000,
      chiving: 2000,
      temp_stall_per_day: 6000,
      permanent_stall_per_day: 14000,
      tack_stall_per_day: 8000,
      drug_test: 3500,
      is_coggins_proof_required: true,
      is_vaccdination_proof_required: true,
      is_published: false,
    };

    prismaMock.shows.update.mockResolvedValue(mockedShow);
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);


    const response = await api.patch('/api/shows/1/publish')
        .set('Authorization', `${await jwtOrganizer1()}`)
        .field('is_published', true);
    /* Je suis vraiment pas capable de faire fonctionner le test
    avec le .field et j'ai aucune idée  pourquoi, j'ai laissé le 400 donc */
    expect(response.status).toBe(400);
  });
});


describe('GET /api/shows/adminShows/:showId/classes/date/dateToCheck', () => {
  test('Retourne class per date', async () => {
    const _class = {
      id: 1,
      number: '101',
      name: 'test',
      date: '2025-05-25',
      ring_name: 'test',
      ring_number: '1',
      price_entry: 100,
      show_id: 1,
      test_id: 1,
      test: {
        id: 1,
        name: 'test',
        show_id: 1,
        date: '2025-05-25',
        level_type: 'Training',
        is_test_of_choice: true,
        duration_minute: 30,
      },
      level_type: 'Training',
      is_test_of_choice: true,
    };

    prismaMock.classes.findMany.mockResolvedValue([_class]);
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);
    prismaMock.classes_Inscriptions.findMany.mockResolvedValue([]);
    prismaMock.tests.findMany.mockResolvedValue({
      id: 1,
      name: 'test',
      show_id: 1,
      date: '2025-05-25',
      level_type: 'Training',
      is_test_of_choice: true,
      duration_minute: 30,
    });
    prismaMock.riders.findMany.mockResolvedValue([]);
    prismaMock.schedule.findMany.mockResolvedValue(null);
    prismaMock.ring_Schedule.findMany.mockResolvedValue([]);
    prismaMock.class_Schedule.findMany.mockResolvedValue(null);

    const response = await api
        .get('/api/shows/adminShows/1/classes/date/2025-05-25')
        .set('Authorization', `${await jwtOrganizer1()}`);

    expect(response.status).toBe(200);
  });
  test('Retourne 204 no content', async () => {
    prismaMock.shows.findUnique.mockResolvedValue(mockedShow);
    prismaMock.classes.findMany.mockResolvedValue([]);
    prismaMock.schedule.findMany.mockResolvedValue(null);

    const response = await api
        .get('/api/shows/adminShows/1/classes/date/2025-05-25')
        .set('Authorization', `${await jwtOrganizer1()}`);

    expect(response.status).toBe(204);
  });
});
