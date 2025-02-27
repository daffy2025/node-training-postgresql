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

//ref: https://stackoverflow.com/questions/11510338/regular-expression-to-match-mysql-timestamp-format-y-m-d-hms
isInvalidTimestamp = (input) => {
    const pattern = /^(((\d{4})(-)(0[13578]|10|12)(-)(0[1-9]|[12][0-9]|3[01]))|((\d{4})(-)(0[469]|1‌​1)(-)([0][1-9]|[12][0-9      ]|30))|((\d{4})(-)(02)(-)(0[1-9]|1[0-9]|2[0-8]))|(([02468]‌​[048]00)(-)(02)(-)(29))|(([13579][26]00)(-)(02)(-)(29))|(([0-9][0-9][0][48])(-)(0‌​2)(-)(29))|(([0-9][0-9][2468][048])(-)(02)(-)(29))|(([0-9][0-9][13579][26])(-)(02‌​)(-)(29)))(\s([0-1][0-9]|2[0-4]):([0-5][0-9]):([0-5][0-9]))$/;
    return !pattern.test(input)
}

module.exports = {
    isInvalidString, isInvalidInteger, isInvalidUuid,
    isInvalidName, isInvalidEmail, isInvalidPassword,
    isInvalidUrl, isInvalidTimestamp}