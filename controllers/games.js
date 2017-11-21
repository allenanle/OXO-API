const express = require('express');
const router = express.Router();
const Game = require('../models/games.js');
const { isValidMove, wonGame } = require('./utils.js');

router.post('/', (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).send('A user id is required to create a game.');
  }

  return Game.new(user_id)
  .then(game => {
    res.status(201).json(game);
  })
  .catch(err => {
    res.status(500).send(err.message);
  });
});

router.post('/:id/users', (req, res) => {
  const game_id = req.params.id;
  const { user_id } = req.body;


  if (!user_id) {
    return res.status(400).send('A user id is required to join a game.');
  }
  return Game.getPlayersByGameId(game_id)
  .then(results => {
    const players = results[0];

    if (players.o_user_id) {
      return res.status(403).send('That game already has 2 players!');
    }

    if (players.o_user_id === user_id) {
      return res.status(403).send('You are already playing in that game.');
    }

    return Game.addPlayer(game_id, user_id)
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
  return Game.getAll()
  .then(games => {
    res.status(200).json(games);
  })
  .catch(err => {
    res.status(500).send(err.message);
  })
})

router.get('/:id', (req, res) => {
  const game_id = req.params.id;

  return Game.getById(game_id)
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

  return Game.getById(game_id)
  .then(game => {

    if (!game) {
      return res.status(404).send('Game not found.');
    }

    let board = game.board;
    
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

    if (wonGame(board, row, col, move)) {
      return Game.updateWinner(game_id, board, user_id)
      .then(game => { 
        return res.status(201).json({board: game.board, winner: game.winner});
      })  
    }

    Game.updateBoard(game_id, board, user_id)
    .then(game => {
      res.status(201).json({board: game.board, winner: game.winner})
    })
  })
  .catch(err => {
    console.log('ERROR NEWGRR', err);
    res.status(400).send(err.message);
  })
})

module.exports = router;