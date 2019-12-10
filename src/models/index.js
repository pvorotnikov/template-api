const nconf = require('nconf');
const mongoose = require('mongoose');
const logger = require('../lib/logger');
const utils = require('../lib/utils');
const { HTTPError, ERROR_CODES } = require('../lib/responses');

/* ================================
 * Schema
 * ================================
 */

 const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique : true },
    password: String,
    role: { type: String, enum : ['user','admin'], default: 'user' },
    dateCreated: { type: Date, default: Date.now },
    dateUpdated: { type: Date, default: Date.now },
});

userSchema.statics.register = async function register (email, password, name, role = 'user') {

    utils.validateEmail(email);
    utils.validateName(name);
    utils.validateRole(role);

    let user
    try {
        user = await new this({ name, email, password: utils.generatePassword(password), role, }).save();
    } catch (err) {
        if (err.code === 11000) {
            throw new HTTPError(`The email ${email} is already in use`, 400, ERROR_CODES.INVALID_DATA);
        } else {
            throw err;
        }
    }
    return user;
}

/* ================================
 * Models
 * ================================
 */
const User = mongoose.model('User', userSchema);

/* ================================
 * Connection
 * ================================
 */

/* istanbul ignore next */
const connection = async function() {
    try {

        const instance = await mongoose.connect(nconf.get('DB_CONNECTION'), {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            keepAlive: true,
            connectTimeoutMS: 30000,
        });
        instance.connection.on('disconnected', () => {
            logger.warn('Mongoose disconnected')
        });
        instance.connection.on('reconnected', () => {
            logger.info('Mongoose reconnected')
        });
        instance.connection.on('error', (err) => {
            logger.error('Mongoose error')
            logger.error(err)
        });
        logger.info('DB connected');
        return instance;

    } catch (err) {
        logger.error('MongoDB connection error:', err.message);
        throw err;
    }
}

module.exports = {
    connection,
    User,
}
