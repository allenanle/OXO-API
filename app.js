const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const UserController = require('./controllers/users.js');
const GameController = require('./controllers/games.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', UserController);
app.use('/games', GameController);


module.exports = app;