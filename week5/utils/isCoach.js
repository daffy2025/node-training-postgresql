const PERMISSION_DENIED_STATUS_CODE = 401
const FORBIDDEN_MESSAGE = '使用者尚未成為教練'

generateError = (status = PERMISSION_DENIED_STATUS_CODE,
                 message = FORBIDDEN_MESSAGE) => {
    const err = new Error(message)
    err.statusCode = status
    err.name = 'failed'
    err.isOperational = true;
    return err
}

module.exports = (req, res, next) => {
    if (!req.user || req.user.role !== 'COACH') {
        next(generateError())
        return
    }
    next()
}