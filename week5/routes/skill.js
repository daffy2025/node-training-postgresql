const express = require('express')
const router = express.Router()

const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Skill')
const { isInvalidString, isInvalidUuid } = require('../utils/verify')
const { ReturnDocument } = require('typeorm')

const repoName = 'Skill'

router.get('/', async (req, res, next) => {
    try {
        const skillRepo = await dataSource.getRepository(repoName)
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
})

router.post('/', async (req, res, next) => {
    try {
        const { name } = req.body;
        if (isInvalidString(name)) {
            res.status(400).json({
                status: "failed",
                message: "欄位未填寫正確"
            })
            return;
        }

        const skillRepo = await dataSource.getRepository(repoName)
        const existSkill = await skillRepo.find({
            where: {
                name
            }
        })
        if (existSkill.length !== 0) {
            res.status(409).json({
                status: "failed",
                message: "資料重複"
            })
            return;
        }

        const newSkill = await skillRepo.create({
            name
        })
        const result = await skillRepo.save(newSkill)
        res.status(200).json({
            status: "success",
            data: result
        })
    }
    catch (err) {
        logger.error(err)
        next(err)
    }
})

router.delete('/:skillId', async (req, res, next) => {
    try {
        const {skillId} = req.params;
        if (isInvalidUuid(skillId)) {
            res.status(400).json({
                status: "failed",
                data: "ID錯誤"
            })
            return;
        }
        const skillRepo = await dataSource.getRepository(repoName);
        const result = await skillRepo.delete(skillId);
        if (result.affected === 0) {
            res.status(400).json({
                status: "failed",
                data: "ID錯誤"
            })
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
})

module.exports = router