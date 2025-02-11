isInvalidString = (input) => {
    return input === undefined || typeof(input) !== 'string' || input.trim().length === 0
}
isInvalidNumber = (input) => {
    return input === undefined || typeof(input) !== 'number'
}
isInvalidUuid = (input) => {
    const pattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const re = new RegExp(pattern);
    return re.test(input) === false
}
module.exports = {isInvalidString, isInvalidNumber, isInvalidUuid};