const jwt = require('jsonwebtoken')

const PERMISSION_DENIED_STATUS_CODE = 401
const FailMessageMap = {
    expired: 'Token 已過期',
    invalid: '無效的 Token',
    missing: '請先登入'
}

const generateError = (status, message) => {
    const err = new Error(message)
    err.statusCode = status
    err.name = 'failed';
    err.isOperational = true;
    return err
}

const formatVerifyError = (jwtError) => {
    let result
    switch (jwtError.name) {
        case 'TokenExpiredERror':
            result = generateError(PERMISSION_DENIED_STATUS_CODE, FailMessageMap.expired)
            break
        default:
            result = generateError(PERMISSION_DENIED_STATUS_CODE, FailMessageMap.invalid)
            break
    }
    return result
}

const verifyJWT = (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (error, decoded) => {
            if (error)
                reject(formatVerifyError(error))
            else
                resolve(decoded)
        })
    })
}
// output
// {
//     "id": "6249368f98f7f965568ad019", //User 資料表 id
//     "iat": 1648968184,  //何時建立臨時通行證
//     "exp": 1712040184   //何時通行證過期
// }

module.exports = ({
    secret,
    userRepository,
    logger = console
}) => {
    if (!secret || typeof secret !== 'string') {
        const errMsg = '[AuthV2] secret is required and must be a string.'
        logger.error(errMsg)
        throw new Error(errMsg)
    }
if (!userRepository || typeof userRepository !== 'object' || typeof userRepository.findOneBy !== 'function') {
        const errMsg = '[AuthV2] userRepository is required, must be a database entity that supports the findOneBy function.'
        logger.error(errMsg)
        throw new Error(errMsg)
    }
    return async (req, res, next) => {
        if (!req.headers ||
            !req.headers.authorization ||
            !req.headers.authorization.startsWith('Bearer')
        ) {
            const errMsg = '[AuthV2] Missing authorization header'
            logger.warn(errMsg)
            next(generateError(PERMISSION_DENIED_STATUS_CODE, FailMessageMap.missing))
            return
        }
        const  [,token] = req.headers.authorization.split(' ')
        if (!token) {
            const errMsg = '[AuthV2] Missing token'
            logger.warn(errMsg)
            next(generateError(PERMISSION_DENIED_STATUS_CODE, FailMessageMap.missing))
            return
        }
        try {
            const verifyResult = await verifyJWT(token, secret)
            const user = await userRepository.findOneBy({id: verifyResult.id})
            if (!user) {
                next(generateError(PERMISSION_DENIED_STATUS_CODE, FailMessageMap.invalid))
                return
            }
            req.user = user
            next()
        } catch (err) {
            logger.error(`[AuthV2] ${err.message}`)
            next(err)
        }
    }
}