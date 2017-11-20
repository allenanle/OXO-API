require('dotenv').config();
const expect = require('chai').expect();
const request = require('supertest');
const app = require('../../app.js');
const User = require('../../models/users.js');
const Game = require('../../models/games.js');
const { db, loadDb } = require('../../db');



let user = {
  username: 'scott'
}

const resetDb = () => (
  db.none('TRUNCATE users, games RESTART IDENTITY CASCADE');
)

// TODO: once models are set up, add before hook to seed test DB
before(() => {
  loadDb(db)
  .then(() => User.new(user.username))
  .then(response => {
    user = response;
  })
  .catch(err => console.error(err));
});

after(() => {
  resetDb();
})

describe('/users', () => {

  describe('POST /users', () => {

    const testUser = {
      username: 'mike'
    }

    it('should create a user', () => {
      request(app)
        .post('/users')
        .send(testUser)
        .end((err, res) => {
          if (err) {
            done(err);
          }

          expect(res.statusCode).to.equal(201);
          expect(res.body.username).to.equal(testUser.username);
          user = res.body;
          done();
      });
    });

    it('should require a username', () => {
      request(app)
        .post('/users')
        .send()
        .end((err, res) => {
          if (err) {
            done(err);
          }

          expect(res.statusCode).to.equal(400);
          expect(res.body.message).to.equal('A username is required to create a user.');
          done();
        });
    });
  });

  describe('GET /users', () => {
    it('should get all users', () => {
      request(app)
        .get('/users')
        .end((err, res) => {
          if (err) {
            done(err);
          }
          
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body[0].username).to.equal(user.username);
          done();
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should get a specific user', () => {
      request(app)
        .get(`users/${user.id}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          
          expect(res.statusCode).to.equal(200);
          expect(res.body.username).to.equal(user.username);
          done();
        });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', () => {
      request(app)
        .delete(`users/${user.id}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          
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
  }

  let userThree = {
    username: 'fred'
  }

  const moveOne = {
    user: user.id,
    row: 0,
    col: 1
  }

  before(() => {
    User.new(userTwo.username)
    .then(user => {
      userTwo = user;
      User.new(userThree.username)
    })
    .then(user => {
      userThree = user;
      Game.new(user.user_id)
    })
    .then(response => {
      game = response;
    })
    .catch(err => console.error(err));
  })


  describe('POST /games', () => {
    it('should create a game', () => {
      request(app)
        .post('/games')
        .send(user)
        .end((err, res) => {
          if (err) {
            done(err);
          }

          expect(res.statusCode).to.equal(201);
          expect(res.body.x_player_id).to.equal(user.id);
          done();
        });
    });

    it('should require a username', () => {
      request(app)
        .post('/games')
        .send(user)
        .end((err, res) => {
          if (err) {
            done(err);
          }

          expect(res.statusCode).to.equal(400);
          expect(res.body.message).to.equal('A username is required to create a game.');
          done();
        });
    });
  });

  describe('POST /games/:id/users', () => {
    it('should add a user to a game', () => {
      request(app)
        .post(`/games/${game.id}/users`)
        .send(userTwo)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          
          expect(res.statusCode).to.equal(201);
          expect(res.body.o_player_id).to.equal(userTwo.id);
          expect(res.body.status).to.equal('active'); 
          game = res.body;
          done();
        });
    });

    it('should prevent user from joining a game that already has two players', () => {
      request(app)
        .post(`/games/${game.id}/users`)
        .send(userThree)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          
          expect(res.statusCode).to.equal(403);
          expect(res.body.message).to.equal('That game already has 2 players!');
        })
    })
  });

  describe('GET /games', () => {
    it('should get all games', () => {
      request(app)
        .get('/games')
        .end((err, res) => {
          if (err) {
            done(err);
          }
          
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
          if (err) {
            done(err);
          }
          
          expect(res.statusCode).to.equal(200);
          expect(res.body.id).to.equal(game.id);
          done();
        });
    });

    it('should return a 404 if the specified game does not exist', () => {
      let toDelete;

      Game.new(user.user_id)
      .then(game => {
        toDelete = game;
        Game.delete(game.game_id)
      })
      .then(() => {
        request(app)
          .get(`/games/${toDelete.game_id}`)
          .end((err, res) => {
            if (err) {
              done(err);
            }

            expect(res.statusCode).to.equal(404);
            expect(res.body.message).to.equal('Game not found.');
          })
      })
      .catch(err => done(err));
    })
  });

  describe('POST /games/:id/moves', () => {
    it('should make a move in a game', () => {
      request(app)
        .post(`/games/${game.id}/moves`)
        .send(moveOne)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          
          expect(res.statusCode).to.equal(201);
          expect(res.body.board).to.be.an('array'); // TODO: check specific location
          done();
        });
    });

    it('should prevent a user from making an invalid move', () => {

    };

    it('should prevent a user from making a move in a game that has not started', () => {

    });

    it('should prevent a user from making a move in an already completed game', () => {

    });

    it('should declare a winner when a player wins the game', () => {

    });

    it('should require coordinates and a user id', () => {

    });

    it('should return a 403 if the user does not belong to the specified game', () => {

    });

    it('should prevent a user from making a move if it is not their turn', () => {

    });
  });

  describe('DELETE /games', () => {
    it('should delete a game', () => {
      request(app)
        .delete(`games/${game.id}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.equal('Game successfully deleted.');
          done();
        });
    });
  });

});





