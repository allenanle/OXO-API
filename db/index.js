const pgp = require('pg-promise')();
const schema = require('./schema.js');

const url = 'postgres://@localhost:5432/tictactoe';
const db = pgp(url);

const loadDb = db => (
  schema(db)
)

module.exports = { db, loadDb };