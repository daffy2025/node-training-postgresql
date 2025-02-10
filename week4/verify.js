isInvalidString = (input) => {
    return input === undefined || typeof(input) !== 'string' || input.trim().length === 0
}
isInvalidNumver = (input) => {
    return input === undefined || typeof(input) !== 'number'
}
isInvalidUuid = (input) => {
    const pattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const re = new RegExp(pattern);
    return re.test(input) === false
}
module.exports = {isInvalidString, isInvalidNumver, isInvalidUuid};