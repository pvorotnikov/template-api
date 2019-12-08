class SuccessResponse {
    constructor(data) {
        this.status = 'ok'
        this.data = data || {}
    }
}

class ErrorResponse {
    constructor(message, errorCode = 'GENERAL_ERROR', data) {
        this.status = 'error'
        this.errorMessage = message || ''
        this.errorCode = errorCode
        this.data = data || {}
    }
}

class HTTPError extends Error {
    constructor(message = 'Error', status = 500, fileName, lineNumber) {
        super(message, fileName, lineNumber)
        this.status = status
    }
}

module.exports = {
    SuccessResponse,
    ErrorResponse,
    HTTPError,
}
