const { dataSource } = require('../db/data-source')

const appError = require('../utils/appError')
const logger = require('../utils/logger')('skill')
const { isInvalidString, isInvalidUuid } = require('../utils/verify')

const repoName = 'Skill'

//取得教練專長列表
const getSkillList = async (req, res, next) => {
    try {
        const skillRepo = dataSource.getRepository(repoName)
        const skills = await skillRepo.find({
            select: ['id','name']
        })
        res.status(200).json({
            status: "success",
            data: skills
        })
    }
    catch (err) {
        logger.error(err)
        next(err)
    }
}

//新增教練專長
const addSkill = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (isInvalidString(name)) {
            appError(400, 'failed', '欄位未填寫正確')
            return;
        }

        const skillRepo = dataSource.getRepository(repoName)
        const existSkill = await skillRepo.findOne({
            where: { name }
        })
        if (existSkill) {
            appError(409, 'failed', '資料重複')
            return;
        }

        const newSkill = skillRepo.create({
            name
        })
        const result = await skillRepo.save(newSkill)
        res.status(200).json({
            status: "success",
            data: {
                id: result.id,
                name: result.name
            }
        })
    }
    catch (err) {
        logger.error(err)
        next(err)
    }
}

//刪除教練專長
const deleteSkill = async (req, res, next) => {
    try {
        const {skillId} = req.params;
        if (isInvalidUuid(skillId)) {
            appError(400, 'failed', 'ID錯誤')
            return;
        }
        const skillRepo = dataSource.getRepository(repoName);
        const result = await skillRepo.delete(skillId);
        if (result.affected === 0) {
            appError(400, 'failed', 'ID錯誤')
            return;
        }
        res.status(200).json({
            status:"success"
        })
}
    catch (err) {
        logger.error(err)
        next(err)
    }
}

module.exports = {
    getSkillList,
    addSkill,
    deleteSkill
}