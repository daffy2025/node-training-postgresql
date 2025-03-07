const express = require('express')
const router = express.Router()

const { dataSource } = require('../db/data-source')

const appError = require('../utils/appError')
const logger = require('../utils/logger')('admin')
const {isInvalidString, isInvalidInteger, isInvalidUuid, 
    isInvalidUrl, isInvalidTimestamp} = require('../utils/verify')

const config = require('../config/index')
const auth = require('../utils/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})
const isCoach = require('../utils/isCoach')

//新增教練課程資料
router.post('/courses', auth, isCoach, async (req, res, next) => {
    try {
        const { id } = req.user
        const { skill_id, name, description, start_at, end_at, max_participants, meeting_url} = req.body;

        if (isInvalidUuid(skill_id) ||
            isInvalidString(name) ||
            isInvalidString(description) || 
            isInvalidInteger(max_participants) ||
            isInvalidTimestamp(start_at) ||
            isInvalidTimestamp(end_at)) {
            const warnMessage = '欄位未填寫正確'
            logger.warn('新增教練課程：',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        /* Option */
        if (meeting_url !== undefined && (
                typeof(meeting_url) !== 'string' ||
                isInvalidUrl(meeting_url))
            ){
            logger.warn('新增教練課程：照片來源網址格式錯誤')
            next(appError(400, 'failed', '欄位未填寫正確', next))
            return
        }
        const skillRepo = dataSource.getRepository('Skill')
        const existingSkill = await skillRepo.findOne({
            where: {id: skill_id}
        })
        if (!existingSkill) {
            const warnMessage = '此專長不存在'
            logger.warn('新增教練課程：',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        const courseRepo = dataSource.getRepository('Course')
        const newCourse = courseRepo.create({
            user_id: id,
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

//將使用者新增為教練
router.post('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { experience_years, description, profile_image_url} = req.body;

        if (isInvalidUuid(userId) ||
            isInvalidInteger(experience_years) || 
            isInvalidString(description)) {
            const warnMessage = '欄位未填寫正確'
            logger.warn('新增教練',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        /* Option */
        if (profile_image_url !== undefined &&
            typeof(profile_image_url) === 'string' &&
            isInvalidUrl(profile_image_url)) {
            logger.warn("新增教練：照片來源網址格式錯誤")
            next(appError(400, 'failed', '欄位未填寫正確', next))
            return
        }
        const userRepo = dataSource.getRepository('User')
        const existingUser = await userRepo.findOne({
            select: ['name','role'],
            where: {id: userId}
        })
        if (!existingUser) {
            const warnMessage = '使用者不存在'
            logger.warn('新增教練',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        if (existingUser.role === 'COACH') {
            const warnMessage = '使用者已經是教練'
            logger.warn('新增教練',warnMessage)
            next(appError(409, 'failed', warnMessage, next))
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
            const warnMessage = '更新使用者失敗'
            logger.warn('新增教練',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
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

//編輯教練課程資料
router.put('/courses/:courseId', auth, isCoach, async (req, res, next) => {
    try {
        const { id } = req.user
        const { courseId } = req.params;
        const { skill_id, name, description, start_at, end_at, max_participants, meeting_url} = req.body;

        if (isInvalidUuid(courseId) ||
            isInvalidUuid(skill_id) ||
            isInvalidString(name) ||
            isInvalidString(description) || 
            isInvalidInteger(max_participants) ||
            isInvalidTimestamp(start_at) ||
            isInvalidTimestamp(end_at)) {
            const warnMessage = '欄位未填寫正確'
            logger.warn('編輯教練課程',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        if (isInvalidString(meeting_url) ||
            isInvalidUrl(meeting_url)) {
            logger.warn("編輯教練課程：照片來源網址格式錯誤")
            next(appError(400, 'failed', '欄位未填寫正確', next))
            return
        }
        const courseRepo = dataSource.getRepository('Course')
        const existingCourse = await courseRepo.findOne({
            select: ['name'],
            where: {id: courseId, user_id: id}
        })
        if (!existingCourse) {
            const warnMessage = '課程不存在'
            logger.warn('編輯教練課程',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        const skillRepo = dataSource.getRepository('Skill')
        const existingSkill = await skillRepo.findOne({
            select: ['name'],
            where: {id: skill_id}
        })
        if (!existingSkill) {
            const warnMessage = '此專長不存在'
            logger.warn('編輯教練課程',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
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
            const warnMessage = '更新課程失敗'
            logger.warn('編輯教練課程',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
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