const express = require('express')
const auth = require('../lib/auth')
const { SuccessResponse, ErrorResponse, HTTPError } = require('../lib/responses')

module.exports = function (app) {

    const router = express.Router()
    app.use('/api/users', router)


    /**
     * @swagger
     *
     * definitions:
     *   NewUser:
     *     type: object
     *     required:
     *       - name
     *       - email
     *       - password
     *     properties:
     *       name:
     *         type: string
     *       email:
     *         type: string
     *       password:
     *         type: string
     *         format: password
     *   User:
     *     allOf:
     *       - $ref: '#/definitions/NewUser'
     *       - required:
     *         - id
     *       - properties:
     *         id:
     *           type: string
     */

    router.get('/me', auth.authorize(), async (req, res, next) => {
        try {
            res.json(new SuccessResponse())
        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message))
        }
    })

    router.get('/', auth.authorize(['admin']), async (req, res, next) => {
        try {
            res.json(new SuccessResponse())
        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message))
        }
    })

    router.post('/', auth.authorize(['admin']), async (req, res, next) => {
        try {
            res.json(new SuccessResponse())
        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message))
        }
    })

    /**
     * @swagger
     *
     * /api/users/:id:
     *   get:
     *     description: Get information about a specific user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: Users unique ID.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: User
     *         schema:
     *           $ref: '#/definitions/User'
     */
    router.get('/:id', auth.authorize(['admin']), async (req, res, next) => {
        try {
            res.json(new SuccessResponse())
        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message))
        }
    })

}
