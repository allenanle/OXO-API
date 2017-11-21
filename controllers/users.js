const express = require('express');
const router = express.Router();
const User = require('../models/users.js');

router.post('/', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).send('A username is required to create a user.');
  }

  return User.new(username)
  .then(user => {
    res.status(201).json(user);
  })
  .catch(err => {
    res.status(400).send('A player with that username already exists.');
  })
})

router.get('/', (req, res) => {
  return User.getAll()
  .then(users => {
    res.status(200).json(users);
  })
  .catch(err => {
    res.status(500).send(err.message);
  })
})

router.get('/:id', (req, res) => {
  const { id } = req.params;
  // TODO: what if id does not exist - check err message
  return User.getById(id)
  .then(user => {
    res.status(200).json(user);
  })
  .catch(err => {
    res.status(400).send(err.message);
  })
})

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  return User.delete(id)
  .then(user => {
    res.status(200).send('User successfully deleted.');
  })
  .catch(err => {
    res.status(400).send(err.message);
  })
})

module.exports = router;