const nconf = require('nconf')
const jwt = require('jsonwebtoken')
const util = require('util')
const { ErrorResponse, HTTPError, ERROR_CODES } = require('./responses')

const sign = util.promisify(jwt.sign)
const verify = util.promisify(jwt.verify)

async function createToken(id, email, role) {
    const data = { email, role }
    const token = await sign(
        data,
        nconf.get('JWT_SECRET'), {
            expiresIn: '30m',
            subject: id,
        }
    );
    return token
}

async function decodeToken(token) {
    const data = await verify(token, nconf.get('JWT_SECRET'))
    return data
}

function authorize(allowedRoles = ['user']) {
    return async (req, res, next) => {

        try {

            // verify header
            const header = req.headers.authorization
            if (!header) {
                throw new HTTPError('Authorization header is required', 401, ERROR_CODES.GENERAL)
            }

            // verify schema
            if (!header.startsWith('Bearer ')) {
                throw new HTTPError('Bearer schema is required', 401, ERROR_CODES.GENERAL)
            }

            // extract token
            const token = header.split('Bearer ')[1]

            // verify and decode token
            let data = {}
            try {
                data = await decodeToken(token)
            } catch (err) {
                throw new HTTPError('Invalid token', 401, ERROR_CODES.INVALID_TOKEN)
            }

            // verify roles
            if (!allowedRoles.includes(data.role)) {
                throw new HTTPError('Insufficient credentials', 403, ERROR_CODES.GENERAL)
            }

            req.user = data
            next()

        } catch (err) {
            res.status(err.status || 500).json(new ErrorResponse(err.message, err.code))
        }

    }
}

module.exports = {
    createToken,
    authorize,
}
