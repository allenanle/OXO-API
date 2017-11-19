module.exports = db => (
  db.query('CREATE TABLE IF NOT EXISTS users(\
    user_id SERIAL PRIMARY KEY,\
    username VARCHAR(30) NOT NULL UNIQUE,\
    created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\
    );')
  .then(() => (
    db.query('CREATE TYPE game_status AS ENUM(\
    waiting, active, complete\
    );')
  ))
  .then(() => (
    db.query('CREATE TYPE player_type AS ENUM(\
    X, O, none\
    );')
  ))
  .then(() => (
    db.query('CREATE TABLE IF NOT EXISTS games(\
    game_id SERIAL PRIMARY KEY,\
    status game_status DEFAULT waiting,\
    winner player_type DEFAULT none,\
    board JSONB,\
    x_player_id INT REFERENCES users ON DELETE CASCADE,\
    o_player_id INT REFERENCES users ON DELETE CASCADE,\
    created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,\
    last_player_move player_type\
    );')
  ))
  .then(() => (
    console.log('schema has been run! wow')
  ))
)