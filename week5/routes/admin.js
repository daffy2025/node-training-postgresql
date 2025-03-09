const express = require('express')
const router = express.Router()

const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('admin')

const config = require('../config/index')
const auth = require('../utils/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})
const isCoach = require('../utils/isCoach')
const admin = require('../controller/admin')

//新增教練課程資料
router.post('/courses', auth, isCoach, admin.createCoachClassRecord)

//取得教練自己的課程詳細資料
router.get('/courses/:courseId', auth, isCoach, admin.getCoachOwnClassRecord)

//取得教練自己的課程列表
router.get('/courses', auth, isCoach, admin.getCoachOwnedCourses)

//將使用者新增為教練
router.post('/:userId', admin.setUserAsCoach)

//編輯教練課程資料
router.put('/courses/:courseId', auth, isCoach, admin.editCoachClassRecord)

//變更教練資料
router.put('/', auth, isCoach, admin.updateCoachProfile)

//取得教練自己的詳細資料
router.get('/', auth, isCoach, admin.getCoachProfile)

module.exports = router