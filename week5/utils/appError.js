const appError = (errCode, errName, errMsg) => {
    const err = new Error(errMsg || '伺服器錯誤')
    err.statusCode = errCode || 500;
    err.name = errName || 'error' ;
    err.isOperational = true;
    throw err
}

module.exports = appError