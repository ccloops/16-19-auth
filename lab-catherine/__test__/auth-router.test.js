'use strict';

require('./lib/setup');
const superagent = require('superagent');
const server = require('../lib/server');
const accountMockFactory = require('./lib/account-mock-factory');

const apiURL = `http://localhost:${process.env.PORT}`;

describe('AUTH Router', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(accountMockFactory.remove);

  describe('POST', () => {
    test('POST creating an account should respond with 200 status code and a token if there are no errors', () => {
      return superagent.post(`${apiURL}/signup`)
        .send({
          username: 'mooshy',
          email: 'mooshy@mooshy.com',
          password: 'redBlanket',
        })
        .then(response => {
          console.log(response.body);
          expect(response.status).toEqual(200);
          expect(response.body.token).toBeTruthy();
        });
    });

    test('POST /signup - an incomplete request should return a 400', () => {
      return superagent.post(`${apiURL}/signup`)
        .send({
          username: 'mooshy',
          email: 'mooshy@mooshy.com',
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(400);
        });
    });

    test('POST /signup - if a key is unique request should return a 409', () => {
      let userToPost = {
        username: 'mooshy',
        email: 'mooshy@mooshy.com',
        password: 'redBlanket',
      };
      return superagent.post(`${apiURL}/signup`)
        .send(userToPost)
        .then(() => { 
          return superagent.post(`${apiURL}/signup`)
            .send(userToPost);
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(409);
        });
    });
  });

  describe('GET /login', () => {
    test('GET /login should get a 200 status code and a token if there are no errors', () => {
      return accountMockFactory.create()
        .then(mock => {
          return superagent.get(`${apiURL}/login`)
            .auth(mock.request.username, mock.request.password);
        })
        .then(response => {
          console.log(response.body);
          expect(response.status).toEqual(200);
          expect(response.body.token).toBeTruthy();
        });
    });
  });
});