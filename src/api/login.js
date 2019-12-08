const express = require('express')
const { SuccessResponse, ErrorResponse, HTTPError } = require('../lib/responses')

module.exports = function (app) {

    const router = express.Router()
    app.use('/api/login', router)

    router.post('/', async (req, res, next) => {
        try {
            res.json(new SuccessResponse())
        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message))
        }
    });

    router.post('/register', async (req, res, next) => {
        try {
            res.json(new SuccessResponse())
        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message))
        }
    });

}
