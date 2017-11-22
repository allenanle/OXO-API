# tic-tac-toe-api

REST API for tic-tac-toe. All interaction with the game occurs through hitting various REST endpoints.

Users and games can be created from the API endpoints described in the [API documentation](API-DOC.md). 

A game begins once two users have joined. Players take turns making moves using the ```/games/:id/moves``` endpoint until either one of the players wins or the board is full.

## API Documentation

See the [API-DOC.md](API-DOC.md) file.

## Tech Stack

  * [Node](https://github.com/nodejs) & [Express](https://github.com/expressjs/express)
  * [PostgreSQL](https://www.postgresql.org/) with [pg-promise](https://github.com/vitaly-t/pg-promise)
  * [Mocha](https://mochajs.org/) with [Chai](http://chaijs.com/) and [Supertest](https://www.npmjs.com/package/supertest)

## Usage

This application uses a PostgreSQL database to store user and game information.

To install Postgres locally on OXS:

```
brew install postgres
```

Before creating the database, you may want to switch to the postgres user (which has full superadmin access) with the following command:

```
sudo -u postgres psql
```

To create the database, run the following command:
```
npm run resetdb
```

Once you've created the database, run the following script from within the root directory to start the server:
```
npm start
```

## Development

### Installing Dependencies

From within the root directory:

```
npm install
```

### Testing

The test suite is built with **Mocha**, **Chai**, and **Supertest** (for mock HTTP requests). To run all tests:

```
npm run test
```

