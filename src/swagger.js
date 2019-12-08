const nconf = require('nconf');

module.exports = {
    info: {
        title: 'Blueprint API',
        version: '1.0.0', // Version (required)
        description: 'A simple blueprint API',
    },
    apis: ['src/api/*.js']
    // host: '', // Host (optional)
    // basePath: '/', // Base path (optional)
};
