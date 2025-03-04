const express = require('express')
const router = express.Router()

const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')("user")

const config = require('../config/index')
const auth = require('../utils/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})

const user = require('../controller/user')

//使用者註冊
router.post('/signup', user.userSingup)

//使用者登入
router.post('/login', user.userSingIn)

//取得個人資料
router.get('/profile', auth, user.userGetProfile)

//更新個人資料
router.put('/profile', auth, user.editUserProfile)

//使用者更新密碼
router.put('/password', auth, user.changeUserPassword)

//取得使用者已購買的方案列表
router.get('/credit-package', auth, user.getPurchasedPackageList)

module.exports = router