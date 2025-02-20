isInvalidString = (input) => {
    return input === undefined || typeof(input) !== 'string' || input.trim().length === 0
}
isInvalidInteger = (input) => {
    return input === undefined || typeof(input) !== 'number' || input <= 0 || input % 1 !== 0
}
isInvalidUuid = (input) => {
    const pattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return pattern.test(input) === false
}

isInvalidName = (input) => {
    const pattern = /^[a-zA-Z]+([0-9a-zA-Z]{1,9})$/
    return pattern.test(input) === false
}

//ref: https://ithelp.ithome.com.tw/articles/10094951
isInvalidEmail = (input) => {
    const pattern = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/
    return pattern.test(input) === false
}

isInvalidPassword = (input) => {
    const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/
    return pattern.test(input) === false
}

isInvalidUrl = (input) => {
    const pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    return pattern.test(input) === false
}

//ref: https://stackoverflow.com/questions/11510338/regular-expression-to-match-mysql-timestamp-format-y-m-d-hms
isInvalidTimestamp = (input) => {
    const pattern = /^(((\d{4})(-)(0[13578]|10|12)(-)(0[1-9]|[12][0-9]|3[01]))|((\d{4})(-)(0[469]|1‌​1)(-)([0][1-9]|[12][0-9]|30))|((\d{4})(-)(02)(-)(0[1-9]|1[0-9]|2[0-8]))|(([02468]‌​[048]00)(-)(02)(-)(29))|(([13579][26]00)(-)(02)(-)(29))|(([0-9][0-9][0][48])(-)(0‌​2)(-)(29))|(([0-9][0-9][2468][048])(-)(02)(-)(29))|(([0-9][0-9][13579][26])(-)(02‌​)(-)(29)))(\s([0-1][0-9]|2[0-4]):([0-5][0-9]):([0-5][0-9]))$/;
    return pattern.test(input) === false
}

module.exports = {
    isInvalidString, isInvalidInteger, isInvalidUuid,
    isInvalidName, isInvalidEmail, isInvalidPassword,
    isInvalidUrl, isInvalidTimestamp}