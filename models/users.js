const { db } = require('../db');

module.exports.new = username => {
  return db.one(
 'INSERT INTO users\
  (username)\
  VALUES ($1)\
  RETURNING *',
  [username]);
};

module.exports.getAll = () => {
  return db.manyOrNone('SELECT * FROM users');
};

module.exports.getById = (id) => {
  return db.oneOrNone('SELECT * FROM users WHERE user_id = $1', [id]);
};

module.exports.delete = (id) => {
  return db.oneOrNone('DELETE FROM users WHERE user_id = $1', [id]);
};