require('dotenv').config();
const expect = require('chai').expect;
const User = require('../../models/users.js');
const { db, loadDb } = require('../../db');



const resetDb = () => (
  db.none('TRUNCATE users RESTART IDENTITY CASCADE')
);

before(() => (
  loadDb(db)
))

after(() => (
  resetDb()
))


let testUser = {
  username: 'scott'
}

describe('Users table', () => {
  

  it('should have a users table', (done) => {
    db.any('SELECT * FROM users')
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      })
  });

  it('should add a new user to the users table', (done) => {
    User.new(testUser.username)
      .then(user => {
        expect(user.user_id).to.exist;
        expect(user.username).to.equal('scott');
        testUser = user;
        done();
      })
      .catch(err => {
        done(err);
      })
  });

  it('should get a list of all users', (done) => {
    User.getAll()
      .then(users => {
        expect(users).to.be.an('array');
        expect(users[0].username).to.equal('scott');
        done();
      })
      .catch(err => {
        done(err);
      })
  })

  it('should retrieve a user by id', (done) => {
    User.getById(testUser.user_id)
      .then(user => {
        expect(user.username).to.equal('scott');
        done();
      })
      .catch(err => {
        done(err);
      })
  })

  it('should delete a user', (done) => {
    User.delete(testUser.user_id)
      .then(() => User.getById(testUser.user_id))
      .then((user) => {
        console.log('user here wow', user)
        expect(user).to.be.null;
        done();
      })
      .catch(err => {
        done(err);
      })
  })
});