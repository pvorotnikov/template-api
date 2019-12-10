const bcrypt = require('bcrypt');
const validator = require('validator');
const { HTTPError, ERROR_CODES } = require('./responses');

function validateEmail(email) {
    if (!validator.isEmail(email)) {
        throw new HTTPError('Valid email required', 400, ERROR_CODES.INVALID_DATA);
    }
}

function validateName(name) {
    if (_.isEmpty(name)) {
        throw new HTTPError('Valid name required', 400, ERROR_CODES.MISSING_DATA);
    }
}

function validateRole(role) {
    const allowedRoles = ['user', 'admin'];
    if (!allowedRoles.includes(role)) {
        throw new HTTPError(`Invalid role ${role}`, 400, ERROR_CODES.INVALID_DATA);
    }
}

function validatePassword(password) {
    if (!validator.isLength(password, {min:6, max:36})) {
        throw new HTTPError('Please, enter a password between 6 and 36 symbols', 400, ERROR_CODES.INVALID_DATA);
    }
}

function generatePassword(password) {
    validatePassword(password);
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds)
    const hash = bcrypt.hashSync(password, salt)
    return hash
}

module.exports = {
    validateEmail,
    validateName,
    validateRole,
    validatePassword,
    generatePassword,
}
