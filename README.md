# tic-tac-toe-api

REST API for a tic-tac-toe game. All interaction with the game occurs through hitting various REST endpoints.

### API Documentation

|Endpoint|Description|
|---|---|
|GET /users|Retrieve a list of all users|
|GET /users/:id|Retrieve a specific user|
|POST /users|Create a new user|
|DELETE /users/:id|Delete a user|
|GET /games|Retrieve a list of all games|
|GET /games/:id|Retrieve status of a specific game|
|POST /games|Create a new game|
|POST /games/:id/users|Add a user to a game
|POST /games/:id/moves|Make a move within a game|
|DELETE /games/:id|Delete a game|
