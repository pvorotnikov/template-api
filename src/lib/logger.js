const nconf = require('nconf')
const winston = require('winston')
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            colorize: 'production' !== nconf.get('NODE_ENV'),
            timestamp: true,
            level: 'debug',
            prettyPrint: true,
            format: winston.format.simple(),
        }),
    ]
})

// stream to be picked up by morgan
logger.stream = {
    write: function (message, encoding) {
        logger.info(message)
    }
}

module.exports = logger
