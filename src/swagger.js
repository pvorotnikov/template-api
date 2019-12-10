const nconf = require('nconf');

module.exports = {
    openapi: '3.0.0',
    info: {
        title: 'Blueprint API',
        version: '1.0.0', // Version (required)
        description: 'A simple blueprint API',
    },
    apis: ['src/api/*.js', 'src/api/*.yaml']
    // host: '', // Host (optional)
    // basePath: '/', // Base path (optional)
};
