const express = require('express');
const router = express.Router();
const Game = require('../models/games.js');
const { isValidMove, wonGame, gameOver } = require('./utils.js');

router.post('/', (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).send('A user id is required to create a game.');
  }

  if (typeof user_id !== 'number') {
    return res.status(400).send('User id must be sent as a number.');
  }

  Game.new(user_id)
  .then(game => {
    res.status(201).json(game);
  })
  .catch(err => {
    console.log('error here', err);
    res.status(500).send('');
  });
});

router.post('/:id/users', (req, res) => {
  const game_id = req.params.id;
  const { user_id } = req.body;


  if (!user_id) {
    return res.status(400).send('A user id is required to join a game.');
  }

  if (typeof user_id !== 'number') {
    return res.status(400).send('User id must be sent as a number.');
  }

  Game.getPlayersByGameId(game_id)
  .then(players => {

    if (!players) {
      return res.status(404).send('Game not found.');
    }

    if (players.o_user_id === user_id || players.x_user_id === user_id) {
      return res.status(403).send('You are already playing in that game.');
    }

    if (players.o_user_id) {
      return res.status(403).send('That game already has 2 players!');
    }

    Game.addPlayer(game_id, user_id)
    .then(game => {;
      res.status(201).json(game);
    })
    .catch(err => {
      res.status(500).send(err.message);
    })
  })
  .catch(err => {
    res.status(500).send(err.message);
  })
})

router.get('/', (req, res) => {
  Game.getAll()
  .then(games => {
    res.status(200).json(games);
  })
  .catch(err => {
    res.status(500).send(err.message);
  })
})

router.get('/:id', (req, res) => {
  const game_id = req.params.id;

  Game.getById(game_id)
  .then(game => {
    if (!game) {
      return res.status(404).send('Game not found.');
    }
    res.status(200).json(game)
  })
  .catch(err => {
    res.status(500).send(err.message);
  })
})

router.post('/:id/moves', (req, res) => {
  const game_id = req.params.id;
  const { user_id, row, col } = req.body;

  if (!user_id || row === undefined || col === undefined) {
    return res.status(400).send('A user, row, and column are required to make a move.');
  }

  Game.getById(game_id)
  .then(game => {

    if (!game) {
      return res.status(404).send('Game not found.');
    }

    const board = game.board;

    if (game.status !== 'active') {
      return res.status(403).send('That game is not active.');
    }

    if (game.previous_move_id === user_id) {
      return res.status(403).send('It is not your turn.');
    }

    if (game.x_user_id !== user_id && game.o_user_id !== user_id) {
      return res.status(403).send('You are not in that game.');
    }

    if (!isValidMove(board, row, col)) {
      return res.status(400).send('Invalid move.');
    }

    const move = game.x_user_id === user_id ? 'X' : 'O'
    board[row][col] = move;
    const playerWonGame = wonGame(board, row, col, move);

    if (playerWonGame || gameOver(board)) {
      const winner = playerWonGame ? move : 'none';
      return Game.updateWinner(game_id, board, winner)
      .then(game => { 
        return res.status(201).json(game);
      })
      .catch(err => console.error(err));
    }

    Game.updateBoard(game_id, board, user_id)
    .then(game => {
      return res.status(201).json(game)
    })
    .catch(err => console.error(err.message));
  })
  .catch(err => {
    return res.status(400).send(err.message);
  })

})

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  Game.delete(id)
  .then(game => {
    res.status(204).send();
  })
  .catch(err => {
    res.status(400).send('Error deleting the game.');
  })
})

module.exports = router;