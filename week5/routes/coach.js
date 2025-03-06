const express = require('express')
const router = express.Router()

const coach = require('../controller/coach')

//取得指定教練課程列表
router.get('/:coachId/courses', coach.getCoachCourses)

//取得教練詳細資訊
router.get('/:coachId', coach.getCoachDetailInfo)

//取得教練列表
router.get('/', coach.getCoachList)

module.exports = router