const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('../lib/auth')
const { SuccessResponse, ErrorResponse, HTTPError, ERROR_CODES } = require('../lib/responses');
const { User } = require('../models');

module.exports = function (app) {

    const router = express.Router();
    app.use('/api/login', router);

    /**
     * @swagger
     *
     * /api/login:
     *   post:
     *     description: Login
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [email, password]
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: User
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/UserResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       type: object
     *                       properties:
     *                         accessToken:
     *                           type: string
     */
    router.post('/', async (req, res, next) => {

        try {

            const user = await User.findOne({ email: req.body.email })

            if (!user) {
                throw new HTTPError('User does not exist', 401, ERROR_CODES.NOT_FOUND)
            }

            if (!bcrypt.compareSync(req.body.password, user.password)) {
                throw new HTTPError('Wrong password', 403, ERROR_CODES.INVALID_DATA)
            }

            const accessToken = await auth.createToken(user.id, user.email, user.role)
            const data =  {
                id: user.id,
                name: user.firstName,
                email: user.lastName,
                role: user.role,
                dateCreated: user.dateCreated,
                dateUpdated: user.dateUpdated,
                accessToken,
            }
            res.json(new SuccessResponse(data))

        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message, err.code))
        }
    });

    /**
     * @swagger
     *
     * /api/login/register:
     *   post:
     *     description: Register
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [email, name, password]
     *             properties:
     *               email:
     *                 type: string
     *               name:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: User
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserResponse'
     */
    router.post('/register', async (req, res, next) => {
        try {
            const { name, email, password } = req.body
            const user = await User.register(email, password, name, 'user')
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
    });




}
