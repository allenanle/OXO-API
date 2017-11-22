const pgp = require('pg-promise')();
const schema = require('./schema.js');

const dbType = process.env.NODE_ENV === 'test' ? 'tictactoetest' : 'tictactoe';
const url = `postgres://@localhost:5432/${dbType}`;
const db = pgp(url);

const loadDb = db => (
  schema(db)
);

if (process.env.NODE_ENV !== 'test') {
  loadDb(db)
  .then(() => {
    console.log('db loaded');
  })
  .catch((err) => {
    console.error(`Error loading db: ${err}.`);
  });
}

module.exports = { db, loadDb };
