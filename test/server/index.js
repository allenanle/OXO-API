const should = require('chai').should();
const expect = require('chai').expect();
const request = require('supertest');
const app = require('../../app.js');


describe('/users', () => {
  
  let user = {
    username: 'scott'
  }

  describe('POST /users', () => {
    it('should create a user', () => {
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body.username).to.equal('scott');
          user = res.body;
          done();
      });
    });
  });

  describe('GET /users', () => {
    it('should get all users', () => {
      request(app)
        .get('/users')
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body).to.be.empty;
          done();
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should get a specific users', () => {
      request(app)
        .get(`users/${user.id}`)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.username).to.equal('scott');
          done();
        });
    });
  });

  describe('DELETE /users', () => {
    it('should delete a user', () => {
      request(app)
        .delete(`users/${user.id}`)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.equal('User successfully deleted.');
          done();
        });
    });
  });

});

describe('/games', () => {

  describe('')
})



