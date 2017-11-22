# API Documentation

|Endpoint|Description|
|---|---|
|POST /users|Create a new user|
|GET /users|Retrieve a list of all users|
|GET /users/:id|Retrieve a specific user|
|DELETE /users/:id|Delete a user|
|POST /games|Create a new game|
|POST /games/:id/users|Add a user to a game
|POST /games/:id/moves|Make a move within a game|
|GET /games|Retrieve a list of all games|
|GET /games/:id|Retrieve status of a specific game|
|DELETE /games/:id|Delete a game|

## Create a user

```
POST /users
```

### Input

|Name|Type|Description|
|---|---|---|
|username|string|Username of the new user.|

```json
{
  "username": "joe"
}
```

### Example Response

```json
Status: 201 Created

{
  "user_id": 4,
  "username": "joe",
  "created": "2017-11-22T01:38:53.943Z"
}

```

## Retrieve a list of all users

```
GET /users
```

### Example Response

```json
Status: 200 OK

[
  {
    "game_id": 3,
    "status": "waiting",
    "winner": null,
    "board": [
      [
        "-",
        "-",
        "-"
      ],
      [
        "-",
        "-",
        "-"
      ],
      [
        "-",
        "-",
        "-"
      ]
    ],
    "x_user_id": 3,
    "o_user_id": null,
    "created": "2017-11-22T01:32:19.819Z",
    "previous_move_id": null
  }
]

```

## Retrieve a specific user

```
GET /users/:id
```

### Example Response

```json
Status: 200 OK

{
  "user_id": 4,
  "username": "joe",
  "created": "2017-11-22T01:38:53.943Z"
}

```

## Delete a user

```
DELETE /users/:id
```

### Example Response

```json
Status: 204 No Content
```

## Create a game

```
POST /games
```

### Input

|Name|Type|Description|
|---|---|---|
|user_id|Number|ID of the user creating the game.|

```json
{
  "user_id": 3
}
```

### Example Response

```json
Status: 201 Created

{
  "game_id": 4,
  "status": "waiting",
  "winner": null,
  "board": [
    [
      "-",
      "-",
      "-"
    ],
    [
      "-",
      "-",
      "-"
    ],
    [
      "-",
      "-",
      "-"
    ]
  ],
  "x_user_id": 3,
  "o_user_id": null,
  "created": "2017-11-22T01:51:06.708Z",
  "previous_move_id": null
}

```

## Add user to a game

```
POST /games/:id/users
```

Note: ID here refers to a game ID.

### Input

|Name|Type|Description|
|---|---|---|
|user_id|Number|ID of the user joining the game.|

```json
{
  "user_id": 4
}
```

### Example Response

```json
Status: 201 Created

{
  "game_id": 4,
  "status": "active",
  "winner": null,
  "board": [
    [
      "-",
      "-",
      "-"
    ],
    [
      "-",
      "-",
      "-"
    ],
    [
      "-",
      "-",
      "-"
    ]
  ],
  "x_user_id": 3,
  "o_user_id": 4,
  "created": "2017-11-22T01:51:06.708Z",
  "previous_move_id": null
}

```

## Make a move in a game

```
POST /games/:id/moves
```

Note: ID here refers to a game ID.

### Input

|Name|Type|Description|
|---|---|---|
|user_id|Number|ID of the user joining the game.|
|row|Number|Row of the desired move.|
|col|Number|Column of the desired move.|

```json
{
  "user_id": 3,
  "row": 1,
  "col": 1
}
```

### Example Response

```json
Status: 201 Created

{
  "game_id": 4,
  "status": "active",
  "winner": null,
  "board": [
    [
      "-",
      "-",
      "-"
    ],
    [
      "-",
      "X",
      "-"
    ],
    [
      "-",
      "-",
      "-"
    ]
  ],
  "x_user_id": 3,
  "o_user_id": 4,
  "created": "2017-11-22T01:51:06.708Z",
  "previous_move_id": 3
}

```

## Retrieve a list of all games

```
GET /games
```

### Example Response

```json
Status: 200 OK

[
  {
    "game_id": 3,
    "status": "waiting",
    "winner": null,
    "board": [
      [
        "-",
        "-",
        "-"
      ],
      [
        "-",
        "-",
        "-"
      ],
      [
        "-",
        "-",
        "-"
      ]
    ],
    "x_user_id": 3,
    "o_user_id": null,
    "created": "2017-11-22T01:32:19.819Z",
    "previous_move_id": null
  }
]

```

## Retrieve status of a specific game

```
GET /users/:id
```

### Example Response

```json
Status: 200 OK

{
  "game_id": 4,
  "status": "active",
  "winner": null,
  "board": [
    [
      "-",
      "-",
      "-"
    ],
    [
      "-",
      "X",
      "-"
    ],
    [
      "-",
      "-",
      "-"
    ]
  ],
  "x_user_id": 3,
  "o_user_id": 4,
  "created": "2017-11-22T01:51:06.708Z",
  "previous_move_id": 3
}

```

## Delete a game

```
DELETE /games/:id
```

### Example Response

```json
Status: 204 No Content
```








