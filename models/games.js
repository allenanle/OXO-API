const { db } = require('../db');

const initialBoard = [['-', '-', '-'],
                      ['-', '-', '-'],
                      ['-', '-', '-']];

module.exports.new = user_id => {
  return db.one(
  'INSERT INTO games\
  (x_user_id, board)\
  VALUES ($1, $2)\
  RETURNING *',
  [user_id, initialBoard])
}

module.exports.addPlayer = (game_id, user_id) => {
  return db.oneOrNone('UPDATE games SET o_user_id = $2, status = $3 \
  WHERE game_id = $1 RETURNING *',
  [game_id, user_id, 'active'])
}

module.exports.updateBoard = (game_id, board, player_id) => {
  return db.oneOrNone('UPDATE games SET board = $1, previous_move_id = $2\
  WHERE game_id = $3 RETURNING *',
  [board, player_id, game_id])
}

module.exports.getById = game_id => {
  return db.oneOrNone('SELECT * FROM games WHERE game_id = $1', [game_id])
}

module.exports.updateWinner = (game_id, board, player_id) => {
  return db.oneOrNone('UPDATE games SET winner_id = $1, status = $2, board = $4\
  WHERE game_id = $3 RETURNING *',
  [game_id, 'finished', player_id, board])
}

module.exports.getPlayersByGameId = (game_id) => {
  return db.query('SELECT x_user_id, o_user_id FROM games\
  WHERE game_id = $1', [game_id]);
}

module.exports.getAll = () => {
  return db.manyOrNone('SELECT * FROM games');
}

module.exports.delete = (id) => {
  return db.oneOrNone('DELETE FROM games WHERE game_id = $1', [id]);
}