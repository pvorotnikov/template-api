// create configuration
const nconf = require('nconf')
nconf.env().defaults({
  PORT: 3000,
  JWT_SECRET: 'signing-key',
  BASE_URL: 'http://127.0.0.1:3000',
})

const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const { ErrorResponse, HTTPError } = require('./lib/responses')
const logger = require('./lib/logger')
const login = require('./api/login')
const users = require('./api/users')

// create app
const app = express()

// setup middleware
app.use(cors())
app.use(morgan('combined', { 'stream': logger.stream }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

login(app)
users(app)

// catch 404 and forward it to error handler
app.use((req, res, next) => {
  let err = new HTTPError('Not Found', 404)
  next(err)
})

// error handler
app.use(function(err, req, res, next) {
    logger.error(err.message)
    res.status(err.status || 500).json(new ErrorResponse(err.message))
})

// export app
module.exports = app
