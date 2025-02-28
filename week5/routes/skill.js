const express = require('express')
const router = express.Router()

const skill = require('../controller/skill')

//取得教練專長列表
router.get('/', skill.getSkillList)

//新增教練專長
router.post('/', skill.addSkill)

//刪除教練專長
router.delete('/:skillId', skill.deleteSkill)

module.exports = router