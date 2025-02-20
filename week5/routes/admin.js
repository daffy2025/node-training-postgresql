const express = require('express')
const router = express.Router()

const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')
const { errHandler } = require('../utils/errHandler')

const {isInvalidString, isInvalidInteger, isInvalidUuid, 
    isInvalidUrl, isInvalidTimestamp} = require('../utils/verify')

router.post('/courses', async (req, res, next) => {
    try {
        const { user_id, skill_id, name, description, start_at, end_at, max_participants, meeting_url} = req.body;

        if (isInvalidUuid(user_id) ||
            isInvalidUuid(skill_id) ||
            isInvalidString(name) ||
            isInvalidString(description) || 
            isInvalidInteger(max_participants) ||
            isInvalidTimestamp(start_at) ||
            isInvalidTimestamp(end_at)) {
            errHandler(res, 400, "新增教練課程", "欄位未填寫正確")
            return
        }
        /* Option */
        if (meeting_url !== undefined && (
                typeof(meeting_url) !== 'string' ||
                isInvalidUrl(meeting_url))
            ){
            logger.warn("新增教練課程：照片來源網址格式錯誤")
            res.status(400).json({
                "status" : "failed",
                "message": "欄位未填寫正確"
            })
            return
        }
        const userRepo = dataSource.getRepository('User')
        const existingUser = await userRepo.findOne({
            select: ['name','role'],
            where: {id: user_id}
        })
        if (!existingUser) {
            errHandler(res, 400, "新增教練課程", "使用者不存在")
            return
        }
        if (existingUser.role !== 'COACH') {
            errHandler(res, 409, "新增教練課程", "使用者尚未成為教練")
            return
        }
        const skillRepo = dataSource.getRepository('Skill')
        const existingSkill = await skillRepo.findOne({
            select: ['name'],
            where: {id: skill_id}
        })
        if (!existingSkill) {
            errHandler(res, 400, "新增教練課程", "此專長不存在")
            return
        }
        const courseRepo = dataSource.getRepository('Course')
        const newCourse = courseRepo.create({
            user_id,
            skill_id,
            name,
            description,
            start_at,
            end_at,
            max_participants,
            meeting_url
        })
        const savedCourse = await courseRepo.save(newCourse)
        res.status(201).json({
            status : "success",
            data: {
                course: savedCourse
            }
        })
    } catch (err) {
        logger.error(err)
        next(err)
    }
})

router.post('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { experience_years, description, profile_image_url} = req.body;

        if (isInvalidUuid(userId) ||
            isInvalidInteger(experience_years) || 
            isInvalidString(description)) {
            errHandler(res, 400, "新增教練", "欄位未填寫正確")
            return
        }
        /* Option */
        if (profile_image_url !== undefined &&
            typeof(profile_image_url) === 'string' &&
            isInvalidUrl(profile_image_url)) {
            logger.warn("新增教練：照片來源網址格式錯誤")
            res.status(400).json({
                "status" : "failed",
                "message": "欄位未填寫正確"
            })
            return
        }
        const userRepo = dataSource.getRepository('User')
        const existingUser = await userRepo.findOne({
            select: ['name','role'],
            where: {id: userId}
        })
        if (!existingUser) {
            errHandler(res, 400, "新增教練", "使用者不存在")
            return
        }
        if (existingUser.role === 'COACH') {
            errHandler(res, 409, "新增教練", "使用者已經是教練")
            return
        }
        const coachRepo = dataSource.getRepository('Coach')
        const newCoach = coachRepo.create({
            user_id: userId,
            experience_years,
            description,
            profile_image_url
        })
        const updateUser = await userRepo.update({
            id: userId,
            role: 'USER'
        }, { 
            role: 'COACH'
        })
        if (updateUser.affected === 0) {
            errHandler(res, 400, "新增教練", "更新使用者失敗")
            return
        }
        const savedCoach = await coachRepo.save(newCoach)
        const savedUser = await userRepo.findOne({
            select: ['name', 'role'],
            where: { id: userId}
        })
        res.status(201).json({
            status : "success",
            data: {
                user: savedUser,
                coach: savedCoach
            }
        })
    } catch (err) {
        logger.error(err)
        next(err)
    }
})

router.put('/courses/:courseId', async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { skill_id, name, description, start_at, end_at, max_participants, meeting_url} = req.body;

        if (isInvalidUuid(courseId) ||
            isInvalidUuid(skill_id) ||
            isInvalidString(name) ||
            isInvalidString(description) || 
            isInvalidInteger(max_participants) ||
            isInvalidTimestamp(start_at) ||
            isInvalidTimestamp(end_at)) {
            errHandler(res, 400, "編輯教練課程", "欄位未填寫正確")
            return
        }
        if (isInvalidString(meeting_url) ||
            isInvalidUrl(meeting_url)) {
            logger.warn("編輯教練課程：照片來源網址格式錯誤")
            res.status(400).json({
                "status" : "failed",
                "message": "欄位未填寫正確"
            })
            return
        }
        const courseRepo = dataSource.getRepository('Course')
        const existingCourse = await courseRepo.findOne({
            select: ['name'],
            where: {id: courseId}
        })
        if (!existingCourse) {
            errHandler(res, 400, "編輯教練課程", "課程不存在")
            return
        }
        const skillRepo = dataSource.getRepository('Skill')
        const existingSkill = await skillRepo.findOne({
            select: ['name'],
            where: {id: skill_id}
        })
        if (!existingSkill) {
            errHandler(res, 400, "編輯教練課程", "此專長不存在")
            return
        }
        const updateCourse = await courseRepo.update({
            id: courseId
        }, {
            skill_id,
            name,
            description,
            start_at,
            end_at,
            max_participants,
            meeting_url
        })
        if (updateCourse.affected === 0) {
            errHandler(res, 400, "編輯教練課程", "更新課程失敗")
            return
        }
        const updatedCourse = await courseRepo.findOne({
            where: {id: courseId}
        })
        res.status(200).json({
            status : "success",
            data: {
                course: updatedCourse
            }
        }) 
    } catch (err) {
        logger.error(err)
        next(err)
    }
})

module.exports = router