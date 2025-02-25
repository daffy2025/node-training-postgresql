const express = require('express')
const router = express.Router()

const { IsNull } = require('typeorm')
const { dataSource } = require('../db/data-source')

const appError = require('../utils/appError')
const logger = require('../utils/logger')("courses")
const {isInvalidUuid} = require('../utils/verify')

const config = require('../config/index')
const auth = require('../utils/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})

//取得課程列表
router.get('/', async (req, res, next) => {
    try {
        const courseRepo = dataSource.getRepository('Course')
        const courses = await courseRepo.find({
            select: {
                id: true,
                name : true,
                description: true,
                start_at: true,
                end_at: true,
                max_participants: true,
                User: {
                    name: true
                },
                Skill: {
                    name: true
                }
            },
            relations: {
                User: true,
                Skill: true
            }
        }).then( courses => courses.map ( course => ({
                id: course.id,
                coach_name : course.User.name,
                skill_name : course.Skill.name,
                name: course.name,
                description: course.description,
                start_at: course.start_at,
                end_at: course.end_at,
                max_participants: course.max_participants
            })
        ))

        res.status(200).json({
            status: "success",
            data: courses
        })
    } catch (err) {
        logger.error(err)
        next(err)
    }
})

//報名課程
router.post('/:courseId', auth, async (req, res, next) => {
    try {
        const { id } = req.user
        const { courseId } = req.params;

        if (isInvalidUuid(courseId)) {
            next(appError(400, 'failed', '欄位未填寫正確', next))
            return;
        }
        const courseRepo = dataSource.getRepository('Course')
        const existCourse = await courseRepo.findOne({
            where: { id: courseId }
        })
        if (!existCourse) {
            next(appError(400, 'failed', 'ID錯誤', next))
            return;
        }
        const courseBookingRepo = dataSource.getRepository('CourseBooking')
        const courseBooked = await courseBookingRepo.findOne({
            where: {
                user_id: id,
                course_id: courseId
            }
        })
        if (courseBooked) {
            next(appError(400, 'failed', '已經報名過此課程', next))
            return;
        }
        const bookedUserCount = await courseBookingRepo.count({
            where: {
                course_id: courseId,
                cancelledAt: IsNull()
            }
        })
        if (bookedUserCount >= existCourse.max_participants) {
            next(appError(400, 'failed', '已達最大參加人數，無法參加', next))
            return;
        }
        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
        const purchased_credits = await creditPurchaseRepo.sum('purchased_credits', {
                user_id: id
            }
        )
        const bookedCourseCount = await courseBookingRepo.count({
            where: {
                user_id: id,
                cancelledAt: IsNull()
            }
        })
        if (bookedCourseCount >= purchased_credits) {
            next(appError(400, 'failed', '已無可使用堂數', next))
            return;
        }
        const bookingCourse = courseBookingRepo.create({
            user_id: id,
            course_id: courseId
        })
        await courseBookingRepo.save(bookingCourse)
        res.status(201).json({
            status : "success",
            data: null
        })
    } catch (err) {
        logger.error(err)
        next(err)
    }
})

//取消課程
router.delete('/:courseId', auth, async (req, res, next) => {
    try {
        const { id } = req.user
        const { courseId } = req.params;

        if (isInvalidUuid(courseId)) {
            next(appError(400, 'failed', '欄位未填寫正確', next))
            return;
        }
        const courseBookingRepo = dataSource.getRepository('CourseBooking')
        const courseBooked = await courseBookingRepo.findOne({
            where: {
                user_id: id,
                course_id: courseId,
                cancelledAt: IsNull()
            }
        })
        if (!courseBooked) {
            next(appError(400, 'failed', '課程不存在', next))
            return;
        }
        const updateCourseBooked = await courseBookingRepo.update({
            user_id: id,
            course_id: courseId,
            cancelledAt: IsNull()
        }, {
            cancelledAt: new Date().toISOString()
        })
        if (updateCourseBooked.affected === 0) {
            next(appError(400, 'failed', '取消失敗', next))
            return;
        }
        res.status(200).json({
            status : "success",
            data: null
        })
    } catch (err) {
        logger.error(err)
        next(err)
    }
})

module.exports = router