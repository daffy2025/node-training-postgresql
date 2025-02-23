const appError = (errCode, errName, errMsg, next) => {
    err = new Error(errMsg || '伺服器錯誤')
    err.statusCode = errCode || 500;
    err.name = errName || 'error' ;
    err.isOperational = true;
    next(err)
}

module.exports = appError