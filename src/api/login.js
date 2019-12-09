const express = require('express');
const bcrypt = require('bcrypt');
const validator = require('validator');
const _ = require('lodash');
const auth = require('../lib/auth')
const { SuccessResponse, ErrorResponse, HTTPError, ERROR_CODES } = require('../lib/responses');
const { User } = require('../models');

module.exports = function (app) {

    const router = express.Router();
    app.use('/api/login', router);

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

    router.post('/register', async (req, res, next) => {
        try {

            const { name, email, password } = req.body

            // validate input
            if (!validator.isEmail(email)) {
                throw new HTTPError('Please, enter a valid email', 400, ERROR_CODES.INVALID_DATA);
            }
            if (!validator.isLength(password, {min:6, max:36})) {
                throw new HTTPError('Please, enter a password between 6 and 36 symbols', 400, ERROR_CODES.INVALID_DATA);
            }
            if (_.isEmpty(name)) {
                throw new HTTPError('Please, enter your name', 400, ERROR_CODES.MISSING_DATA);
            }

            // create the user
            let user
            try {
                user = await new User({ name, email, password: generatePassword(password) }).save()
            } catch (err) {
                if (err.code === 11000) {
                    throw new HTTPError(`The email ${email} is already in use`, 400, ERROR_CODES.INVALID_DATA)
                } else {
                    throw err
                }
            }

            // return the user
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


    function generatePassword(password) {
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds)
        const hash = bcrypt.hashSync(password, salt)
        return hash
    }

}
