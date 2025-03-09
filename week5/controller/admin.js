const { dataSource } = require('../db/data-source')

const appError = require('../utils/appError')
const logger = require('../utils/logger')('admin')
const {isInvalidString, isInvalidInteger, isInvalidUuid, 
    isInvalidUrl, isInvalidTimestamp} = require('../utils/verify')

const { calculateStatus, bookedCourseParticipants } = require('./courses')

//新增教練課程資料
const createCoachClassRecord = async (req, res, next) => {
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
            appError(400, 'failed', warnMessage)
            return
        }
        /* Option */
        if (meeting_url !== undefined && (
                typeof(meeting_url) !== 'string' ||
                isInvalidUrl(meeting_url))
            ){
            logger.warn('新增教練課程：照片來源網址格式錯誤')
            appError(400, 'failed', '欄位未填寫正確')
            return
        }
        const skillRepo = dataSource.getRepository('Skill')
        const existingSkill = await skillRepo.findOne({
            where: {id: skill_id}
        })
        if (!existingSkill) {
            const warnMessage = '此專長不存在'
            logger.warn('新增教練課程：',warnMessage)
            appError(400, 'failed', warnMessage)
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
}

//將使用者新增為教練
const setUserAsCoach = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { experience_years, description, profile_image_url} = req.body;

        if (isInvalidUuid(userId) ||
            isInvalidInteger(experience_years) || 
            isInvalidString(description)) {
            const warnMessage = '欄位未填寫正確'
            logger.warn('新增教練',warnMessage)
            appError(400, 'failed', warnMessage)
            return
        }
        /* Option */
        if (profile_image_url !== undefined &&
            typeof(profile_image_url) === 'string' &&
            isInvalidUrl(profile_image_url)) {
            logger.warn("新增教練：照片來源網址格式錯誤")
            appError(400, 'failed', '欄位未填寫正確')
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
            appError(400, 'failed', warnMessage)
            return
        }
        if (existingUser.role === 'COACH') {
            const warnMessage = '使用者已經是教練'
            logger.warn('新增教練',warnMessage)
            appError(409, 'failed', warnMessage)
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
            appError(400, 'failed', warnMessage)
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
}

//編輯教練課程資料
const editCoachClassRecord = async (req, res, next) => {
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
            appError(400, 'failed', warnMessage)
            return
        }
        if (isInvalidString(meeting_url) ||
            isInvalidUrl(meeting_url)) {
            logger.warn("編輯教練課程：照片來源網址格式錯誤")
            appError(400, 'failed', '欄位未填寫正確')
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
            appError(400, 'failed', warnMessage)
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
            appError(400, 'failed', warnMessage)
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
            appError(400, 'failed', warnMessage)
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
}


//取得教練自己的課程列表
const getCoachOwnedCourses = async (req, res, next) => {
    try {
        const { id } = req.user;
        const coachRepo = dataSource.getRepository('Coach')
        const matchCoach = await coachRepo.findOne({
            where: {user_id: id},
        })

        if (!matchCoach) {
            appError(400, 'failed', '找不到教練')
            return;
        }

        const courseRepo = dataSource.getRepository('Course')
        const rawCourses  = await courseRepo
            .createQueryBuilder("Course")
            .where("Course.user_id = :id", { id })
            .select([ 'id', 'name', 'start_at', 'end_at', 'max_participants' ])
            .getRawMany()
            
        const courses = await Promise.all(
            rawCourses.map(async (course) => {
                const participants = await bookedCourseParticipants(course.id);
                return {
                    ...course,
                    status: calculateStatus(course.start_at, course.end_at),
                    participants
                }
            })
        );            

        res.status(200).json({
            status: "success",
            data: courses
        })
    } catch(err) {
        logger.error(err)
        next(err)
    }
}

//取得教練自己的課程詳細資料
const getCoachOwnClassRecord = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { courseId } = req.params;

        if (isInvalidUuid(courseId)) {
            const warnMessage = '欄位未填寫正確'
            appError(400, 'failed', warnMessage)
            return
        }

        const coachRepo = dataSource.getRepository('Coach')
        const matchCoach = await coachRepo.findOne({
            where: {user_id: id},
        })

        if (!matchCoach) {
            appError(400, 'failed', '找不到教練')
            return;
        }

        const courseRepo = dataSource.getRepository('Course')
        const course = await courseRepo
            .createQueryBuilder("Course")
            .where("Course.user_id = :id", { id })
            .andWhere("Course.id = :courseId", { courseId })
            .innerJoin("Course.Skill", "Skill")
            .select([
                'Course.id as id',
                'Course.name AS name',
                'description',
                'start_at',
                'end_at',
                'max_participants',
                'Skill.name AS skill_name'
            ])
            .getRawMany()

        if (course.length === 0) {
            const warnMessage = '課程不存在'
            appError(400, 'failed', warnMessage)
            return
        }
        res.status(200).json({
            status: "success",
            data: course
        })
    } catch(err) {
        logger.error(err)
        next(err)
    }
}

//變更教練資料
const updateCoachProfile = async (req, res, next) => {
    try {
        const { id } = req.user
        const { experience_years, description, profile_image_url, skill_ids} = req.body;

        if (isInvalidInteger(experience_years) || 
            isInvalidString(description) ||
            isInvalidString(profile_image_url) ||
            Array.isArray( skill_ids ) === false) {
            const warnMessage = '欄位未填寫正確'
            logger.warn('變更教練資料',warnMessage)
            appError(400, 'failed', warnMessage)
            return
        }

        if (isInvalidUrl(profile_image_url)) {
            logger.warn("變更教練資料：照片來源網址格式錯誤")
            appError(400, 'failed', '欄位未填寫正確')
            return
        }

        const skillRepo = dataSource.getRepository('Skill')
        await Promise.all(
            skill_ids.map( async (skill_id) => {
                if (isInvalidUuid(skill_id)) {
                    logger.warn("變更教練資料：教練專長格式錯誤")
                    appError(400, 'failed', '欄位未填寫正確')
                }
                const existSkill = await skillRepo.findOneBy({id: skill_id})
                if (!existSkill) {
                    logger.warn("變更教練資料：專長不存在")
                    appError(400, 'failed', '專長不存在')
                }
            })
        )
        const coachRepo = dataSource.getRepository('Coach')
        const existCoach = await coachRepo.findOne({
            where: {user_id: id},
        })
        if (!existCoach) {
            logger.warn("變更教練資料：找不到教練")
            appError(400, 'failed', '找不到教練')
        }

        const updatedCoach = await coachRepo
            .createQueryBuilder()
            .update('Coach')
            .set({
                experience_years,
                description,
                profile_image_url
            })
            .where("user_id = :id", { id })
            .execute()

        if (updatedCoach.affected === 0) {
            const warnMessage = '變更教練資料'
            logger.warn('變更教練資料失敗',warnMessage)
            appError(400, 'failed', warnMessage)
            return
        }

        const courseLinkSkillRepo = dataSource.getRepository('CoachLinkSkill')

        await Promise.all(
            skill_ids.map(async (skill_id) => {
                const newCourseLinkSkill = courseLinkSkillRepo.create({
                    coach_id: existCoach.id,
                    skill_id: skill_id
                })
                return await courseLinkSkillRepo.save(newCourseLinkSkill)
            })
        )

        res.status(201).json({
            status : "success",
            data: {
                image_url: profile_image_url
            }
        })
    } catch(err) {
        logger.error(err)
        next(err)
    }
}

module.exports = {
    createCoachClassRecord,
    setUserAsCoach,
    editCoachClassRecord,
    getCoachOwnedCourses,
    getCoachOwnClassRecord,
    updateCoachProfile
}