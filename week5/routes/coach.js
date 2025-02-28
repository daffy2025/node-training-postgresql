const express = require('express')
const router = express.Router()

const coach = require('../controller/coach')
//取得教練列表
router.get('/', coach.getCoachList)

//取得教練詳細資訊
router.get('/:coachId', coach.getCoachDetailInfo)

module.exports = router