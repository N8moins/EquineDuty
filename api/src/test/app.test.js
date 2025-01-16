require('dotenv').config();
const supertest = require('supertest');
const {app} = require('../app.js');
const api = supertest(app);

describe('GET /', function() {
  test('responds with hello world', async () => {
    const response = await api.get('/');
    expect(response.body).toEqual({message: 'Hello World!'});
  });
});

module.exports = api;
