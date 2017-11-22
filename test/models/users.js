const expect = require('chai').expect;
process.env.NODE_ENV = 'test';
const User = require('../../models/users.js');
const { db, loadDb } = require('../../db');

const resetDb = () => (
  db.none('TRUNCATE users RESTART IDENTITY CASCADE')
);

let testUser = {
  username: 'scott'
}


describe('Users table', () => {

  before(() => {
    return loadDb(db)
    .then(() => User.new(testUser.username))
    .then(user => {
      testUser = user;
    })
    .catch(err => console.error(err));
  });

  after(() => (
    resetDb()
  ));

  const newUser = {
    username: 'newplayer'
  }

  it('should add a new user to the users table', () => {
    return User.new(newUser.username)
      .then(user => {
        expect(user.user_id).to.exist;
        expect(user.username).to.equal(newUser.username);
      })
      .catch(err => {
        expect.fail(err.actual, err.expected, err.message);
      });
  });

  it('should get a list of all users', () => {
    return User.getAll()
      .then(users => {
        expect(users).to.be.an('array');
        expect(users[0].username).to.exist;
      })
      .catch(err => {
        expect.fail(err.actual, err.expected, err.message);
      });
  })

  it('should retrieve a user by id', () => {
    return User.getById(testUser.user_id)
      .then(user => {
        expect(user.username).to.equal(testUser.username);
      })
      .catch(err => {
        expect.fail(err.actual, err.expected, err.message);
      });
  })

  it('should delete a user', () => {
    return User.delete(testUser.user_id)
      .then(() => User.getById(testUser.user_id))
      .then((user) => {
        expect(user).to.be.null;
      })
      .catch(err => {
        expect.fail(err.actual, err.expected, err.message);
      });
  })
});