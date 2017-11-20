const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../app.js');
const User = require('../../models/users.js');
const Game = require('../../models/games.js');
const { db, loadDb } = require('../../db');

let user = {
  username: 'scott'
}

let userTwo = {
  username: 'mike',
}

let userThree = {
  username: 'fred'
}

const resetDb = () => (
  db.none('TRUNCATE users, games RESTART IDENTITY CASCADE')
)

before((done) => {
  loadDb(db)
  .then(() => User.new(user.username))
  .then(response => {
    user = response;
    return User.new(userTwo.username)
  })
  .then(response => {
    userTwo = response;
    return User.new(userThree.username)
  })
  .then(response => {
    userThree = response;
    done();
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

    it('should create a user', (done) => {
      request(app)
        .post('/users')
        .send(testUser)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.statusCode).to.equal(201);
          expect(res.body.username).to.equal(testUser.username);
          done();
      });
    });

    it('should require a username', (done) => {
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
    it('should get all users', (done) => {
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
    it('should get a specific user', (done) => {
      request(app)
        .get(`users/${user.user_id}`)
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
    it('should delete a user', (done) => {
      let toDelete;

      User.new('to-delete')
      .then(user => {
        toDelete = user;
        request(app)
          .delete(`users/${toDelete.user_id}`)
          .end((err, res) => {
            if (err) {
              done(err);
            }
            
            expect(res.statusCode).to.equal(200);
            expect(res.body.message).to.equal('User successfully deleted.');
            done();
          });
      })
    });
  });

});

describe('/games', () => {

  describe('POST /games', () => {
    it('should create a game', (done) => {
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

    it('should require a username', (done) => {
      request(app)
        .post('/games')
        .send()
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

  describe('POST /games/:id/users', (done) => {

    let game;

    beforeEach((done) => {
      Game.new(user.user_id)
      .then(response => {
        game = response;
        done();
      })
      .catch(err => console.error(err));
    })  

    it('should add a user to a game', (done) => {
      request(app)
        .post(`/games/${game.game_id}/users`)
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

    it('should prevent user from joining a game that already has two players', (done) => {
      Game.addPlayer(game.game_id, userTwo.user_id)
      .then(() => {
        request(app)
          .post(`/games/${game.game_id}/users`)
          .send(userThree)
          .end((err, res) => {
            if (err) {
              done(err);
            }
            
            expect(res.statusCode).to.equal(403);
            expect(res.body.message).to.equal('That game already has 2 players!');
          })
      })
      .catch(err => done(err));
    })
  });

  describe('GET /games', () => {
    let game;

    before((done) => {  
      Game.new(user.user_id)
      .then(response => {
        game = response;
        done();
      })
      .catch(err => console.error(err));
    });

    it('should get all games', (done) => {
      request(app)
        .get('/games')
        .end((err, res) => {
          if (err) {
            done(err);
          }
          
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body[0].id).to.equal(game.game_id);
          done();
        });
    });
  });

  describe('GET /games/:id', () => {
    let game;

    before((done) => {  
      Game.new(user.user_id)
      .then(response => {
        game = response;
        done();
      })
      .catch(err => console.error(err));
    });

    it('should get a specific game', (done) => {
      request(app)
        .get(`/games/${game.game_id}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          
          expect(res.statusCode).to.equal(200);
          expect(res.body.id).to.equal(game.game_id);
          done();
        });
    });

    it('should return a 404 if the specified game does not exist', (done) => {
      Game.delete(game.game_id)
      .then(() => {
        request(app)
          .get(`/games/${game.game_id}`)
          .end((err, res) => {
            if (err) {
              done(err);
            }

            expect(res.statusCode).to.equal(404);
            expect(res.body.message).to.equal('Game not found.');
            done();
          })
      });
    });
  });

  describe('POST /games/:id/moves', () => {
    let game;

    beforeEach((done) => {
      Game.new(user.user_id)
      .then(response => {
        game = response;
        return Game.addPlayer(game.game_id, userTwo.user_id)
      })
      .then(response => {
        game = response;
        done();
      })
      .catch(err => console.error(err));
    })

    const moveOne = {
      user: user.user_id,
      row: 0,
      col: 1
    }

    it('should make a move in a game', (done) => {
      request(app)
        .post(`/games/${game.game_id}/moves`)
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

    it('should prevent a user from making an invalid move', (done) => {
      const invalidMove = {
        user: user.user_id,
        row: -1,
        col: 1
      }

      request(app)
        .post(`/games/${game.game_id}/moves`)
        .send(invalidMove)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.statusCode).to.equal(400);
          expect(res.body.message).to.equal('Invalid move.');
          done();
        })
    });

    it('should prevent a user from making a move in a game that has not started', (done) => {
      const move = {
        user: user.user_id,
        row: 1,
        col: 1
      }
      let newGame;

      Game.new(user.user_id)
      .then(response => {
        newGame = response;
        request(app)
          .post(`/games/${newGame.game_id}/moves`)
          .send(move)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.statusCode).to.equal(403); // TODO: compare with 409
            expect(res.body.message).to.equal('That game has not started yet.');
            done();
          })
      })
    });

    it('should prevent a user from making a move in an already completed game', (done) => {
      const move = {
        user: user.user_id,
        row: 1,
        col: 1
      }

      Game.updateWinner(game.game_id, user.user_id)
      .then(() => {
        request(app)
          .post(`/games/${game.game_id}/moves`)
          .send(move)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.statusCode).to.equal(403); // TODO: see if this is best code
            expect(res.body.message).to.equal('That game is already over.');
            done();
          })
      })
    });

    xit('should declare a winner when a player wins the game', (done) => {

    });

    it('should require coordinates and a user id', (done) => {
      const move = {
        row: 1,
        col: 2
      }

      request(app)
        .post(`/games/${game.game_id}/moves`)
        .send(move)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.statusCode).to.equal(400);
          expect(res.body.message).to.equal('A user id is required to make a move');
          done();
        })
    });

    it('should return a 403 if the user does not belong to the specified game', (done) => {
      const move = {
        user: userThree.user_id,
        row: 2,
        col: 1
      }

      request(app)
        .post(`/games/${game.game_id}/moves`)
        .send(move)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.statusCode).to.equal(403);
          expect(res.body.message).to.equal('You are not in that game.');
          done();
        })
    });

    it('should prevent a user from making a move if it is not their turn', (done) => {
      const move1 = {
        user: user.user_id,
        row: 1,
        col: 1
      }

      const move2 = {
        user: user.user_id,
        row: 1,
        col: 2
      }

      request(app)
        .post(`/games/${game.game_id}/moves`)
        .send(move1)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          request(app)
            .post(`/games/${game.game_id}/moves`)
            .send(move2)
            .end((err, res) => {
              if (err) {
                return done(err);
              }

              expect(res.statusCode).to.equal(403);
              expect(res.body.message).to.equal('It is not your turn.');
              done();
            })
        })
    });
  });

  describe('DELETE /games', () => {

    let game;

    before((done) => {  
      Game.new(user.user_id)
      .then(response => {
        game = response;
        done();
      })
      .catch(err => console.error(err));
    });

    it('should delete a game', (done) => {
      request(app)
        .delete(`games/${game.game_id}`)
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





