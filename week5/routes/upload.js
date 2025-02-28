const express = require('express')
const router =  express.Router()

const { dataSource } = require('../db/data-source')

const logger = require('../utils/logger')('upload')

const config = require('../config/index')
const auth = require('../utils/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})

const upload = require('../controller/upload')

//上傳圖片
router.post('/', auth, upload.uploadFile)

module.exports = router