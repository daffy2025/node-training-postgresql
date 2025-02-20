const logger = require('../utils/logger')("errHandler")

errHandler = (res, errCode, warnGrp, warnMessage) => {
    logger.warn(`${warnGrp}：${warnMessage}`)
    return res.status(errCode).json({
            "status" : "failed",
            "message": warnMessage
    })
}

module.exports = {errHandler}
