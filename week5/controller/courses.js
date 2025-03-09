const { IsNull } = require('typeorm')
const { dataSource } = require('../db/data-source')

const appError = require('../utils/appError')
const logger = require('../utils/logger')('courses')
const {isInvalidUuid} = require('../utils/verify')

//取得課程列表
const getCourseList = async (req, res, next) => {
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
}

const coursePurchasedCredits = async (query_user_id) => {
    try {
        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
        const purchased_credits = await creditPurchaseRepo.sum('purchased_credits', {
                user_id: query_user_id
            }
        )
        return purchased_credits
    } catch (err) {
        logger.error(err)
        next(err)
    }
}

const calculateStatus = (startDate, endDate) => {
    const now = new Date();
    if (now < startDate) return "尚未開始";
    if (now >= startDate && now <= endDate) return "報名中";
    return "已結束";
};
       
const bookedCourseParticipants = async (courseId) => {
    try {
        const courseBookingRepo = dataSource.getRepository('CourseBooking')
        const courseBooked = await courseBookingRepo.count({
            where: {
                course_id: courseId,
                cancelledAt: IsNull()
            }
        })
        return courseBooked
    } catch(err) {
        logger.error(err)
        next(err)
    }
}

//報名課程
const bookingCourse = async (req, res, next) => {
    try {
        const { id } = req.user
        const { courseId } = req.params;

        if (isInvalidUuid(courseId)) {
            appError(400, 'failed', '欄位未填寫正確')
            return;
        }
        const courseRepo = dataSource.getRepository('Course')
        const existCourse = await courseRepo.findOne({
            where: { id: courseId }
        })
        if (!existCourse) {
            appError(400, 'failed', 'ID錯誤')
            return;
        }
        const status = calculateStatus(existCourse.start_at, existCourse.end_at)
        if (status === '已結束') {
            appError(400, 'failed', '課程已結束，不可報名')
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
        if (courseBooked) {
            appError(400, 'failed', '已經報名過此課程')
            return;
        }
        const bookedUserCount = await bookedCourseParticipants(courseId)
        if (bookedUserCount >= existCourse.max_participants) {
            appError(400, 'failed', '已達最大參加人數，無法參加')
            return;
        }
        const purchased_credits = await coursePurchasedCredits(id)
        const bookedCourseCount = await courseBookingRepo.count({
            where: {
                user_id: id,
                cancelledAt: IsNull()
            }
        })
        if (bookedCourseCount >= purchased_credits) {
            appError(400, 'failed', '已無可使用堂數')
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
}

//取消課程
const cancelCourse = async (req, res, next) => {
    try {
        const { id } = req.user
        const { courseId } = req.params;

        if (isInvalidUuid(courseId)) {
            appError(400, 'failed', '欄位未填寫正確')
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
            appError(400, 'failed', '課程不存在')
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
            appError(400, 'failed', '取消失敗')
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
}

module.exports = {
    getCourseList,
    bookingCourse,
    cancelCourse,
    coursePurchasedCredits, /* tool */
    calculateStatus, /* tool */
    bookedCourseParticipants /* tool */
}