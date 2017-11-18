const should = require('chai').should();
const expect = require('chai').expect();
const request = require('supertest');
const app = require('../../app.js');

let user = {
  username: 'scott'
}

describe('/users', () => {


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
    it('should get a specific user', () => {
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

  let game;

  let userTwo = {
    username: 'mike',
    id: 2 // TODO: replace this with user in db
  }

  const moveOne = {
    user: user.id,
    row: 0,
    col: 1
  }

  describe('POST /games', () => {
    it('should create a game', () => {
      request(app)
        .post('/games')
        .send(user.id)
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body.x_player_id).to.equal(user.id);
          game = res.body;
          done();
        });
    })
  });

  describe('POST /games/:id/users', () => {
    it('should add a user to a game', () => {
      request(app)
        .post(`/games/${game.id}/users`)
        .send(userTwo.id)
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body.o_player_id).to.equal(userTwo.id);
          expect(res.body.status).to.equal('active'); // game should now be active
          game = res.body;
          done();
        });
    });
  });

  describe('GET /games', () => {
    it('should get all games', () => {
      request(app)
        .get('/games')
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body[0].id).to.equal(game.id);
          done();
        });
    });
  });

  describe('GET /games/:id', () => {
    it('should get a specific game', () => {
      request(app)
        .get(`/games/${game.id}`)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.id).to.equal(game.id);
          done();
        });
    });
  });

  describe('POST /games/:id/moves', () => {
    it('should make a move in a game', () => {
      request(app)
        .post(`/games/${game.id}/moves`)
        .send(moveOne)
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body.board).to.be.an('array'); // TODO: check specific location
          done();
        });
    });
  });

  describe('DELETE /games', () => {
    it('should delete a game', () => {
      request(app)
        .delete(`games/${game.id}`)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.equal('Game successfully deleted.');
          done();
        });
    });
  });

});





