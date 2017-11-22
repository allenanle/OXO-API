const expect = require('chai').expect;
const request = require('supertest');

process.env.NODE_ENV = 'test';
const app = require('../../app.js');
const User = require('../../models/users.js');
const { db, loadDb } = require('../../db');

const resetDb = () => (
  db.none('TRUNCATE users RESTART IDENTITY CASCADE')
);

describe('Users endpoints', () => {

  let user = {
    username: 'scott'
  };

  let userTwo = {
    username: 'mike'
  };

  let userThree = {
    username: 'fred'
  };

  before(() => {
    return loadDb(db)
    .then(() => User.new(user.username))
    .then(response => {
      user = response;
      return User.new(userTwo.username);
    })
    .then(response => {
      userTwo = response;
      return User.new(userThree.username);
    })
    .then(response => {
      userThree = response;
    })
    .catch(err => console.error(err));
  });

  after(() => {
    resetDb();
  });

  describe('POST /users', () => {

    const testUser = {
      username: 'test'
    };

    it('should create a user', () => {
      return request(app)
        .post('/users')
        .send(testUser)
        .then(res => {
          expect(res.statusCode).to.equal(201);
          expect(res.body.username).to.equal(testUser.username);
        })
        .catch(err => {
          expect.fail(err.actual, err.expected, err.message);
        });    
    });

    it('should require a username', () => {
      return request(app)
        .post('/users')
        .send()
        .then(res => {
          expect(res.statusCode).to.equal(400);
          expect(res.text).to.equal('A username is required to create a user.');
        })
        .catch(err => {
          expect.fail(err.actual, err.expected, err.message);
        });     
    });
  });

  describe('GET /users', () => {
    it('should get all users', () => {
      return request(app)
        .get('/users')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body[0].username).to.equal(user.username);
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should get a specific user', () => {
      return request(app)
        .get(`/users/${user.user_id}`)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.username).to.equal(user.username);
        })
        .catch(err => {
          expect.fail(err.actual, err.expected, err.message);
        });             
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', () => {
      let toDelete;

      return User.new('to-delete')
      .then(user => {
        toDelete = user;
        return request(app)
          .delete(`/users/${toDelete.user_id}`)
          .then(res => {
            expect(res.statusCode).to.equal(204);
          })
          .catch(err => {
            expect.fail(err.actual, err.expected, err.message);
          });      
      })
    });
  });
});
