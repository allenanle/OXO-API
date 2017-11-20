const expect = require('chai').expect;
const Game = require('../../models/games.js');
const User = require('../../models/users.js');
const { db, loadDb } = require('../../db');



const resetDb = () => (
  db.none('TRUNCATE users, games RESTART IDENTITY CASCADE')
);


let player1;
let player2;


let testGame;

let expectedBoard = [['-', '-', '-'],
                     ['-', '-', '-'],
                     ['-', '-', '-']];

describe('Games table', () => {

  before(() => (
    loadDb(db)
    .then(() => User.new('scott'))
    .then(user => {
      player1 = user;
      return User.new('mike')
    })
    .then(user => {
      player2 = user;
    })
    .catch(err => {
      console.error(err)
    })
  ))

  after(() => (
    resetDb()
  ))

  it('should have a games table', (done) => {
    db.any('SELECT * FROM games')
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      })
  });

  it('should add a new game to the games table', (done) => {
    Game.new(player1.user_id)
      .then(game => {
        expect(game.game_id).to.exist;
        expect(game.x_user_id).to.equal(player1.user_id);
        expect(game.status).to.equal('waiting');
        expect(game.board).to.equal(JSON.stringify(expectedBoard));
        testGame = game;
        done();
      })
      .catch(err => {
        console.log(err);
        done(err);
      })
  });

  it('should add a user to a game', (done) => {
    Game.addPlayer(testGame.game_id, player2.user_id)
      .then(results => {
        const game = results[0];
        expect(game.o_user_id).to.equal(player2.user_id);
        expect(game.status).to.equal('active');
        done();
      });
      .catch(err => {
        done(err);
      });
  });

  it('should update a game when a player makes a move', (done) => {
    const updatedBoard = [...expectedBoard];
    updatedBoard[0][1] = 'X';

    Game.updateBoard(testGame.game_id, updatedBoard, player1.user_id)
      .then(results => {
        const game = results[0];
        expect(game.board).to.equal(JSON.stringify(updatedBoard));
        expect(game.previous_move_id).to.equal(player1.user_id);
        done();
      });
      .catch(err => {
        done(err);
      });
  });

  it('should retrieve a game by id', (done) => {
    Game.getById(testGame.game_id)
      .then(game => {
        expect(game.x_user_id).to.equal(player1.user_id);
        expect(game.o_user-id).to.equal(player2.user_id);
        expect(game.status).to.equal('active');
        done();
      });
      .catch(err => {
        done(err);
      });
  })

  it('should update the winner of a game', (done) => {
    Game.updateWinner(testGame.game_id, player1.user_id)
      .then(results => {
        const game = results[0];
        expect(game.winner_id).to.equal(player1.user_id);
        expect(game.status).to.equal('finished');
        done();
      });
      .catch(err => {
        done(err);
      });
  });
})