const validator = require('validator')

isInvalidString = (input) => {
    return input === undefined || typeof(input) !== 'string' || validator.isEmpty(input.trim())
}
isInvalidInteger = (input) => {
    return typeof input !== 'number' || input <= 0
}
isInvalidUuid = (input) => {
    return input === undefined || !validator.isUUID(input)
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

const urlOptions = {
    protocols: ['http', 'https'], // 限制只接受 http 和 https 協議的 URL
    require_tld: true, // 要求 URL 必須有頂級域名 (例如 .com, .org)
    require_protocol: true, // 要求 URL 必須包含協議 (http:// 或 https://)
    allow_underscores: false, // 不允許域名中出現下劃線
    allow_trailing_dot: false, // 不允許 URL 尾部有點號
    allow_fragments: true, // 是否允許包含片段標識符 (# 之後的部分)
    allow_query_components: true // 是否允許查詢參數 (? 之後的部分)
};

isInvalidUrl = (input) => {
    return !validator.isURL(input, urlOptions)
}

//ref: https://stackoverflow.com/questions/11510338/regular-expression-to-match-mysql-timestamp-format-y-m-d-hms
isInvalidTimestamp = (input) => {
    const pattern = /^(((\d{4})(-)(0[13578]|10|12)(-)(0[1-9]|[12][0-9]|3[01]))|((\d{4})(-)(0[469]|1‌​1)(-)([0][1-9]|[12][0-9      ]|30))|((\d{4})(-)(02)(-)(0[1-9]|1[0-9]|2[0-8]))|(([02468]‌​[048]00)(-)(02)(-)(29))|(([13579][26]00)(-)(02)(-)(29))|(([0-9][0-9][0][48])(-)(0‌​2)(-)(29))|(([0-9][0-9][2468][048])(-)(02)(-)(29))|(([0-9][0-9][13579][26])(-)(02‌​)(-)(29)))(\s([0-1][0-9]|2[0-4]):([0-5][0-9]):([0-5][0-9]))$/;
    return !pattern.test(input)
}

module.exports = {
    isInvalidString, isInvalidInteger, isInvalidUuid,
    isInvalidName, isInvalidEmail, isInvalidPassword,
    isInvalidUrl, isInvalidTimestamp
}