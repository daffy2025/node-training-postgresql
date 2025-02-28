const express = require('express')
const router = express.Router()

const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')("creditPackage")

const config = require('../config/index')
const auth = require('../utils/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})

const coursePackage = require('../controller/creditPackage')

//使用者購買方案
router.post('/:creditPackageId', auth, coursePackage.pruchasePackage)

//取得購買方案列表
router.get('/', coursePackage.getCoursePackageList)

//新增購買方案
router.post('/', coursePackage.addCoursePackage)

//刪除購買方案
router.delete('/:creditPackageId', coursePackage.deleteCoursePackage)

module.exports = router
