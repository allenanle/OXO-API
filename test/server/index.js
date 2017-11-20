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

before(() => {
  return loadDb(db)
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
  })
  .catch(err => console.error(err));
});

after(() => {
  resetDb();
})

xdescribe('/users', () => {

  describe('POST /users', () => {

    const testUser = {
      username: 'mike'
    }

    it('should create a user', () => {
      return request(app)
        .post('/users')
        .send(testUser)
        .then(res => {
          expect(res.statusCode).to.equal(201);
          expect(res.body.username).to.equal(testUser.username);
        })
    });

    it('should require a username', () => {
      return request(app)
        .post('/users')
        .send()
        .then(res => {
          expect(res.statusCode).to.equal(400);
          expect(res.body.message).to.equal('A username is required to create a user.');
        })
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
        })
    });
  });

  describe('GET /users/:id', () => {
    it('should get a specific user', () => {
      return request(app)
        .get(`users/${user.user_id}`)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.username).to.equal(user.username);
        })          
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', () => {
      let toDelete;

      return User.new('to-delete')
      .then(user => {
        toDelete = user;
        return request(app)
          .delete(`users/${toDelete.user_id}`)
          .then(res => {
            expect(res.statusCode).to.equal(200);
            expect(res.body.message).to.equal('User successfully deleted.');
          })  
      })
    });
  });

});

describe('/games', () => {

  describe('POST /games', () => {
    it('should create a game', () => {
      return request(app)
        .post('/games')
        .send(user)
        .then(res => {
          expect(res.statusCode).to.equal(201);
          expect(res.body.x_player_id).to.equal(user.id);
        })
    });

    it('should require a username', () => {
      return request(app)
        .post('/games')
        .send()
        .then(res => {
          expect(res.statusCode).to.equal(400);
          expect(res.body.message).to.equal('A username is required to create a game.');
        })
    });
  });

  describe('POST /games/:id/users', () => {

    let game;

    beforeEach(() => {
      return Game.new(user.user_id)
      .then(response => {
        game = response;
      })
      .catch(err => console.error(err));
    })  

    it('should add a user to a game', () => {
      return request(app)
        .post(`/games/${game.game_id}/users`)
        .send(userTwo)
        .then(res => {
          expect(res.statusCode).to.equal(201);
          expect(res.body.o_player_id).to.equal(userTwo.id);
          expect(res.body.status).to.equal('active'); 
        })         
    });

    it('should prevent user from joining a game that already has two players', () => {
      return Game.addPlayer(game.game_id, userTwo.user_id)
      .then(() => {
        return request(app)
          .post(`/games/${game.game_id}/users`)
          .send(userThree)
          .then(res => {
            expect(res.statusCode).to.equal(403);
            expect(res.body.message).to.equal('That game already has 2 players!');
          })
      })
      .catch(err => (err));
    })
  });

  describe('GET /games', () => {
    let game;

    before(() => {  
      return Game.new(user.user_id)
      .then(response => {
        game = response;
      })
      .catch(err => console.error(err));
    });

    it('should get all games', () => {
      return request(app)
        .get('/games')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body[0].id).to.equal(game.game_id);
        })         
    });
  });

  describe('GET /games/:id', () => {
    let game;

    before(() => {  
      return Game.new(user.user_id)
      .then(response => {
        game = response;
      })
      .catch(err => console.error(err));
    });

    it('should get a specific game', () => {
      return request(app)
        .get(`/games/${game.game_id}`)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.id).to.equal(game.game_id);
        })          
    });

    it('should return a 404 if the specified game does not exist', () => {
      return Game.delete(game.game_id)
      .then(() => {
        return request(app)
          .get(`/games/${game.game_id}`)
          .then(res => {
            expect(res.statusCode).to.equal(404);
            expect(res.body.message).to.equal('Game not found.');  
          })
      });
    });
  });

  describe('POST /games/:id/moves', () => {
    let game;

    beforeEach(() => {
      return Game.new(user.user_id)
      .then(response => {
        game = response;
        return Game.addPlayer(game.game_id, userTwo.user_id)
      })
      .then(response => {
        game = response;
      })
      .catch(err => console.error(err));
    })

    const moveOne = {
      user: user.user_id,
      row: 0,
      col: 1
    }

    it('should make a move in a game', () => {
      return request(app)
        .post(`/games/${game.game_id}/moves`)
        .send(moveOne)
        .then(res => {
          expect(res.statusCode).to.equal(201);
          expect(res.body.board).to.be.an('array'); // TODO: check specific location
        })          
    });

    it('should prevent a user from making an invalid move', () => {
      const invalidMove = {
        user: user.user_id,
        row: -1,
        col: 1
      }

      return request(app)
        .post(`/games/${game.game_id}/moves`)
        .send(invalidMove)
        .then(res => {
          expect(res.statusCode).to.equal(400);
          expect(res.body.message).to.equal('Invalid move.');
        })
    });

    it('should prevent a user from making a move in a game that has not started', () => {
      const move = {
        user: user.user_id,
        row: 1,
        col: 1
      }
      let newGame;

      return Game.new(user.user_id)
      .then(response => {
        newGame = response;
        return request(app)
          .post(`/games/${newGame.game_id}/moves`)
          .send(move)
          .then(res => {
            expect(res.statusCode).to.equal(403); // TODO: compare with 409
            expect(res.body.message).to.equal('That game has not started yet.');  
          })
      })
    });

    it('should prevent a user from making a move in an already completed game', () => {
      const move = {
        user: user.user_id,
        row: 1,
        col: 1
      }

      return Game.updateWinner(game.game_id, user.user_id)
      .then(() => {
        return request(app)
          .post(`/games/${game.game_id}/moves`)
          .send(move)
          .then(res => {
            expect(res.statusCode).to.equal(403); // TODO: see if this is best code
            expect(res.body.message).to.equal('That game is already over.');  
          })
      })
    });

    xit('should declare a winner when a player wins the game', () => {

    });

    it('should require coordinates and a user id', () => {
      const move = {
        row: 1,
        col: 2
      }

      return request(app)
        .post(`/games/${game.game_id}/moves`)
        .send(move)
        .then(res => {
          expect(res.statusCode).to.equal(400);
          expect(res.body.message).to.equal('A user id is required to make a move');
        })
    });

    it('should return a 403 if the user does not belong to the specified game', () => {
      const move = {
        user: userThree.user_id,
        row: 2,
        col: 1
      }

      return request(app)
        .post(`/games/${game.game_id}/moves`)
        .send(move)
        .then(res => {
          expect(res.statusCode).to.equal(403);
          expect(res.body.message).to.equal('You are not in that game.');
        })
    });

    it('should prevent a user from making a move if it is not their turn', () => {
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

      return request(app)
        .post(`/games/${game.game_id}/moves`)
        .send(move1)
        .then(res => {
          return request(app)
            .post(`/games/${game.game_id}/moves`)
            .send(move2)
            .then(res => {
              expect(res.statusCode).to.equal(403);
              expect(res.body.message).to.equal('It is not your turn.');   
            })
        })
    });
  });

  xdescribe('DELETE /games', () => {

    let game;

    before(() => {  
      Game.new(user.user_id)
      .then(response => {
        game = response;
      })
      .catch(err => console.error(err));
    });

    it('should delete a game', () => {
      return request(app)
        .delete(`games/${game.game_id}`)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.equal('Game successfully deleted.');
        })
    });
  });

});





