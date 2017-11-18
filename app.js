const express = require('express');
const app = express();

app.get('/users', (req, res) => {
  res.status(200).json([]);
});

app.post('/users', (req, res) => {
  res.status(201).json({username: 'scott'})
})

module.exports = app;