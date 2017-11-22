const expect = require('chai').expect;
const assert = require('chai').assert;

process.env.NODE_ENV = 'test';
const Game = require('../../models/games.js');
const User = require('../../models/users.js');
const { db, loadDb } = require('../../db');

const resetDb = () => (
  db.none('TRUNCATE users, games RESTART IDENTITY CASCADE')
);


let player1;
let player2;
let testGame;

const expectedBoard = [['-', '-', '-'],
                     ['-', '-', '-'],
                     ['-', '-', '-']];

describe('Games table', () => {

  before(() => {
    return loadDb(db)
    .then(() => User.new('scott'))
    .then(user => {
      player1 = user;
      return User.new('mike');
    })
    .then(user => {
      player2 = user;
      return Game.new(player1.user_id);
    })
    .then(game => {
      testGame = game;
    })
    .catch(err => console.error(err));
  });

  after(() => (
    resetDb()
  ));

  it('should add a new game to the games table', () => {
    return Game.new(player1.user_id)
      .then(game => {
        expect(game.game_id).to.exist;
        expect(game.x_user_id).to.equal(player1.user_id);
        expect(game.status).to.equal('waiting');
        expect(game.board).to.deep.equal(expectedBoard);
      })
      .catch(err => {
        expect.fail(err.actual, err.expected, err.message);
      });
  });

  it('should add a user to a game', () => {
    return Game.addPlayer(testGame.game_id, player2.user_id)
      .then(game => {
        expect(game.o_user_id).to.equal(player2.user_id);
        expect(game.status).to.equal('active');
      })
      .catch(err => {
        expect.fail(err.actual, err.expected, err.message);
      });
  });

  it('should update a game when a player makes a move', () => {
    const updatedBoard = [...expectedBoard];
    updatedBoard[0][1] = 'X';

    return Game.updateBoard(testGame.game_id, updatedBoard, player1.user_id)
      .then(game => {
        expect(game.board).to.deep.equal(updatedBoard);
        expect(game.previous_move_id).to.equal(player1.user_id);
      })
      .catch(err => {
        expect.fail(err.actual, err.expected, err.message);
      });
  });

  it('should retrieve a game by id', () => {
    return Game.getById(testGame.game_id)
      .then(game => {
        expect(game.x_user_id).to.equal(player1.user_id);
      })
      .catch(err => {
        expect.fail(err.actual, err.expected, err.message);
      });
  });

  it('should update the winner of a game', () => {
    const board = [...expectedBoard];

    board[0][0] = 'X';
    board[1][0] = 'X';
    board[2][0] = 'X';

    return Game.updateWinner(testGame.game_id, board, 'X')
      .then(game => {
        expect(game.winner).to.equal('X');
        expect(game.status).to.equal('finished');
      })
      .catch(err => {
        expect.fail(err.actual, err.expected, err.message);
      });
  });
});
