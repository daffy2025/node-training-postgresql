const express = require('express')
const router = express.Router()

const { dataSource } = require('../db/data-source')

const logger = require('../utils/logger')('courses')

const config = require('../config/index')
const auth = require('../utils/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})

const course = require('../controller/courses')

//取得課程列表
router.get('/', course.getCourseList)

//報名課程
router.post('/:courseId', auth,  course.bookingCourse)

//取消課程
router.delete('/:courseId', auth, course.cancelCourse)

module.exports = router