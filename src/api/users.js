const express = require('express');
const validator = require('validator');
const _ = require('lodash');
const auth = require('../lib/auth');
const utils = require('../lib/utils');
const { User } = require('../models');
const { SuccessResponse, ErrorResponse, HTTPError, ERROR_CODES } = require('../lib/responses');

module.exports = function (app) {

    const router = express.Router()
    app.use('/api/users', router)


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
    });


    router.put('/:id', auth.authorize('admin'), async (req, res, next) => {
        try {

            // ensure user exists
            const user = await User.findById(req.params.id);
            if (!user) {
                throw new HTTPError('User not found', 404, ERROR_CODES.NOT_FOUND);
            }

            const { name, email, password, role } = req.body;
            const updateParams = {};

            if (!_.isEmpty(name)) {
                utils.validateName(name);
                updateParams.name = name;
            }

            if (!_.isEmpty(email)) {
                utils.validateEmail(email);
                updateParams.email = email;
            }

            if (!_.isEmpty(password)) {
                // generatePassword calls validatePassword internally
                updateParams.password = utils.generatePassword(password);
            }

            if (!_.isEmpty(role)) {
                utils.validateRole(role);
                updateParams.role = role;
            }

            await User.findByIdAndUpdate(req.params.id, updateParams);

            const data = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                dateCreated: user.dateCreated,
                dateUpdated: user.dateUpdated,
                ...updateParams,
            };
            delete data.password;
            res.json(new SuccessResponse(data));

        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message, err.code));
        }
    });


    router.delete('/:id', auth.authorize('admin'), async (req, res, next) => {
        try {

            // you can't delete yourself
            if (req.user.sub === req.params.id) {
                throw new HTTPError('You can\'t delete yourself!', 400, ERROR_CODES.INVALID_DATA);
            }

            // ensure user exists
            const user = await User.findById(req.params.id);
            if (!user) {
                throw new HTTPError('User not found', 404, ERROR_CODES.NOT_FOUND);
            }

            // remove user
            await user.remove();
            res.json(new SuccessResponse());

        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message, err.code));
        }
    });


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


    router.put('/me', auth.authorize('user', 'admin'), async (req, res, next) => {
        try {
            const user = await User.findById(req.user.sub);

            const { name, email, password } = req.body;
            const updateParams = {};

            if (!_.isEmpty(name)) {
                utils.validateName(name);
                updateParams.name = name;
            }

            if (!_.isEmpty(email)) {
                utils.validateEmail(email);
                updateParams.email = email;
            }

            if (!_.isEmpty(password)) {
                // generatePassword calls validatePassword internally
                updateParams.password = utils.generatePassword(password);
            }

            await User.findByIdAndUpdate(req.params.id, updateParams);

            const data = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                dateCreated: user.dateCreated,
                dateUpdated: user.dateUpdated,
                ...updateParams,
            };
            delete data.password;
            res.json(new SuccessResponse(data));

        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message, err.code))
        }
    })

}
