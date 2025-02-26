const validator = require('validator')

isInvalidString = (input) => {
    return typeof(input) !== 'string' || validator.isEmpty(input.trim())
}
isInvalidInteger = (input) => {
    return !validator.isInt(input.toString(), {min: 1})
}
isInvalidUuid = (input) => {
    return !validator.isUUID(input)
}

//中文字符的 Unicode 範圍是 \u4e00-\u9fa5
isInvalidName = (input) => {
    const pattern = /^[a-zA-Z\u4e00-\u9fa5]+([0-9a-zA-Z\u4e00-\u9fa5]{1,9})$/
    return !pattern.test(input)
}

//ref: https://ithelp.ithome.com.tw/articles/10094951
isInvalidEmail = (input) => {
    return !validator.isEmail(input)
}

isInvalidPassword = (input) => {
    const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/
    return !pattern.test(input)
}

isInvalidUrl = (input) => {
    return !validator.isURL(input)
}

isInvalidTimestamp = (input) => {
    const date = new Date(input)
    return !isNaN(date.getTime())
}

module.exports = {
    isInvalidString, isInvalidInteger, isInvalidUuid,
    isInvalidName, isInvalidEmail, isInvalidPassword,
    isInvalidUrl, isInvalidTimestamp}