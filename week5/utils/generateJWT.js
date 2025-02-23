const jwt = require('jsonwebtoken')

/**
 * create JSON Web Token
 * @param {Object} payload token content
 * @param {String} secret token secret
 * @param {Object} [option] same to npm package - jsonwebtoken
 * @returns {String}
 */
module.exports = (payload, secret, options = {}) => new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
            reject(err)
            return
        }
        resolve(token)
    })
})

// output：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyNDk0NzUzMzI4OTMzMDM0NmYxMDkyNCIsImlhdCI6MTY0ODk2OTU1NSwiZXhwIjoxNzEyMDQxNTU1fQ.bjUj8QgQao6pgFE1MMzZeiD4q0d-VJN0a5CznJr4ZnE
