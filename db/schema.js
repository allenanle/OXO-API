module.exports = db => (

  db.query('CREATE TABLE IF NOT EXISTS users(\
    user_id SERIAL PRIMARY KEY,\
    username VARCHAR(30) NOT NULL UNIQUE,\
    created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\
    );')
  .then(() => (
    db.query('SELECT 1 from pg_type where typname = $1', ['game_status'])
    .then((results) => {
      if (!results.length) {
        return db.query('CREATE TYPE game_status AS ENUM(\
        $1, $2, $3)\
        ', ['waiting', 'active', 'finished']);
      }
    })
  ))
  .then(() => (
    db.query('SELECT 1 from pg_type where typname = $1', ['player_type'])
    .then((results) => {
      if (!results.length) {
        return db.query('CREATE TYPE player_type AS ENUM(\
        $1, $2, $3)\
        ', ['X', 'O', 'none']);
      }
    })
  ))
  .then(() => (
    db.query('CREATE TABLE IF NOT EXISTS games(\
    game_id SERIAL PRIMARY KEY,\
    status game_status DEFAULT $1,\
    winner player_type,\
    board text [3][3],\
    x_user_id INT REFERENCES users ON DELETE CASCADE,\
    o_user_id INT REFERENCES users ON DELETE CASCADE,\
    created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,\
    previous_move_id INT REFERENCES users ON DELETE CASCADE\
    )', ['waiting'])
  ))
  .catch(err => {
    console.error(err);
  })
);