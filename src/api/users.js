const express = require('express');
const auth = require('../lib/auth');
const { SuccessResponse, ErrorResponse, HTTPError, ERROR_CODES } = require('../lib/responses');
const { User } = require('../models');

module.exports = function (app) {

    const router = express.Router()
    app.use('/api/users', router)


    router.get('/me', auth.authorize('user', 'admin'), async (req, res, next) => {
        try {
            const user = await User.findById(req.user.sub);
            const data = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                dateCreated: user.dateCreated,
                dateUpdated: user.dateUpdated,
            };
            res.json(new SuccessResponse(data));
        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message, err.code))
        }
    })


    router.get('/', auth.authorize('admin'), async (req, res, next) => {
        try {
            const users = await User.find()
            const data = users.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                dateCreated: u.dateCreated,
                dateUpdated: u.dateUpdated
            }));
            res.json(new SuccessResponse(data))
        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message, err.code))
        }
    })


    router.post('/', auth.authorize('admin'), async (req, res, next) => {
        try {
            const { name, email, password, role } = req.body
            const user = await User.register(email, password, name, role)
            const data = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                dateCreated: user.dateCreated,
                dateUpdated: user.dateUpdated,
            }
            res.json(new SuccessResponse(data))
        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message, err.code))
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
    router.get('/:id', auth.authorize('admin'), async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                throw new HTTPError('User not found', 404, ERROR_CODES.NOT_FOUND);
            }

            const data = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                dateCreated: user.dateCreated,
                dateUpdated: user.dateUpdated,
            };
            res.json(new SuccessResponse(data));
        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message, err.code));
        }
    })

}
