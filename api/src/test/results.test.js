const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);
const {prismaMock} = require('../../prisma/singleton.js');
const {jwtSecretary1} = require('./utils.js');

describe('GET shows/:showId/tests/:testId/riders/:riderId/results',
    function() {
      test('respond with the results', async () => {
        prismaMock.shows.findUnique.mockResolvedValue({id: 1});
        prismaMock.tests.findUnique.mockResolvedValue({id: 1});
        prismaMock.riders.findFirst.mockResolvedValue({id: 1});
        prismaMock.judges_Classes.findUnique.mockResolvedValue({id: 1});
        prismaMock.results.findFirst.mockResolvedValue({id: 1});

        const response = await api.get(
            '/api/shows/1/results/tests/1/riders/1/judges/1')
            .set('Authorization', `${await jwtSecretary1()}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
      });
    });

describe('GET results/shows/showId', function() {
  test('Respond with 200', async () => {
    const show = {
      name: 'Show 1',
      start_date: '2023-08-02T16:54:55.361Z',
    };

    const classes = [
      {
        name: 'Jumping Class A',
        number: 'Alloa',
        test: {
          name: 'Basic Test',
          results: [
            {
              rider_name: 'Jane Doe',
              horse_name: 'Thunder',
              score: 70,
              rider_entry_number: 1,
            },
            {
              rider_name: 'Jane Doe',
              horse_name: 'Thunder',
              score: 50,
              rider_entry_number: 1,
            },
            {
              rider_name: 'Jane Doe',
              horse_name: 'Thunder',
              score: 20,
              rider_entry_number: 1,
            },
          ],
        },
      },
    ];

    prismaMock.shows.findUnique.mockResolvedValue(show);
    prismaMock.classes.findMany.mockResolvedValue(classes);

    const response = await api.get('/api/results/shows/1');
    expect(response.status).toBe(200);
  });
});

describe('POST shows/:showId/tests/:testId/riders/:riderId/results',
    function() {
      test('respond with the results', async () => {
        const result = {
          score: 20,
          nbErrors: 2,
          reason: 'RETIRED',
          horse_id: 1,
          rider_entry_number: 1,
        };

        prismaMock.results.findFirst.mockResolvedValue();
        prismaMock.shows.findUnique.mockResolvedValue({id: 1});
        prismaMock.tests.findUnique.mockResolvedValue({id: 1});
        prismaMock.riders.findFirst.mockResolvedValue({id: 1});
        prismaMock.judges_Classes.findUnique.mockResolvedValue({id: 1});
        prismaMock.inscriptions.findFirst.mockResolvedValue({id: 1});
        prismaMock.horses.findUnique.mockResolvedValue({id: 1, name: 'Allo'});
        prismaMock.riders.findFirst.mockResolvedValue({id: 1, name: 'Allo'});
        prismaMock.results.create.mockResolvedValue(result);

        const response = await api.post(
            '/api/shows/1/results/tests/1/riders/1/judges/1')
            .set('Authorization', `${await jwtSecretary1()}`)
            .send(result);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('score');

        prismaMock.results.findFirst.mockResolvedValue();
        prismaMock.tests.findUnique.mockResolvedValue({id: 1});
        prismaMock.riders.findFirst.mockResolvedValue({id: 1});
        prismaMock.judges_Classes.findUnique.mockResolvedValue();
        prismaMock.inscriptions.findFirst.mockResolvedValue({id: 1});
        prismaMock.results.create.mockResolvedValue(result);

        const response2 =
        await api.post('/api/shows/1/results/tests/1/riders/1/judges/1')
            .set('Authorization', `${await jwtSecretary1()}`)
            .send(result);

        expect(response2.status).toBe(404);
        expect(response2.body.error).toBe('Judge id not found');

        prismaMock.results.findFirst.mockResolvedValue();
        prismaMock.tests.findUnique.mockResolvedValue({id: 1});
        prismaMock.riders.findFirst.mockResolvedValue({id: 1});
        prismaMock.judges_Classes.findUnique.mockResolvedValue({id: 1});
        prismaMock.inscriptions.findFirst.mockResolvedValue();
        prismaMock.results.create.mockResolvedValue(result);

        const response3 =
        await api.post('/api/shows/1/results/tests/1/riders/1/judges/1')
            .set('Authorization', `${await jwtSecretary1()}`)
            .send(result);

        expect(response3.status).toBe(404);
        expect(response3.body.error).toBe('Rider entry number not found');

        prismaMock.results.findFirst.mockResolvedValue({id: 1});
        prismaMock.shows.findUnique.mockResolvedValue({id: 1});
        prismaMock.tests.findUnique.mockResolvedValue({id: 1});
        prismaMock.riders.findFirst.mockResolvedValue({id: 1});
        prismaMock.judges_Classes.findUnique.mockResolvedValue({id: 1});
        prismaMock.inscriptions.findFirst.mockResolvedValue({id: 1});
        prismaMock.horses.findUnique.mockResolvedValue({id: 1, name: 'Allo'});
        prismaMock.riders.findFirst.mockResolvedValue({id: 1, name: 'Allo'});
        prismaMock.results.create.mockResolvedValue(result);

        const response4 = await api.post(
            '/api/shows/1/results/tests/1/riders/1/judges/1')
            .set('Authorization', `${await jwtSecretary1()}`)
            .send(result);
        expect(response4.status).toBe(403);
      });

      describe('DELETE shows/:showId/tests/:testId/riders/:riderId/results',
          function() {
            test('respond with the results', async () => {
              prismaMock.results.findFirst.mockResolvedValue({id: 1});
              prismaMock.shows.findUnique.mockResolvedValue({id: 1});
              prismaMock.tests.findUnique.mockResolvedValue({id: 1});
              prismaMock.riders.findFirst.mockResolvedValue({id: 1});
              prismaMock.judges_Classes.findUnique.mockResolvedValue({id: 1});
              prismaMock.results.findFirst.mockResolvedValue({id: 1});
              prismaMock.results.delete.mockResolvedValue({id: 1});

              const response = await api.delete(
                  '/api/shows/1/results/tests/1/riders/1/judges/1')
                  .set('Authorization', `${await jwtSecretary1()}`);

              expect(response.status).toBe(200);
              expect(response.body).toHaveProperty('id');

              prismaMock.shows.findUnique.mockResolvedValue({id: 1});
              prismaMock.tests.findUnique.mockResolvedValue({id: 1});
              prismaMock.riders.findFirst.mockResolvedValue({id: 1});
              prismaMock.judges_Classes.findUnique.mockResolvedValue({id: 1});
              prismaMock.results.findFirst.mockResolvedValue();
              prismaMock.results.delete.mockResolvedValue({id: 1});

              const response2 = await api.delete(
                  '/api/shows/1/results/tests/1/riders/1/judges/1')
                  .set('Authorization', `${await jwtSecretary1()}`);

              expect(response2.status).toBe(204);
            });
          });
    });
