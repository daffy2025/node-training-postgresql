const express = require('express')
const router = express.Router()

const { dataSource } = require('../db/data-source')

const appError = require('../utils/appError')
const logger = require('../utils/logger')('coach')
const {isInvalidString, isInvalidInteger, isInvalidUuid} = require('../utils/verify')

//取得教練列表
router.get('/', async (req, res, next) => {
    try {
        const {per, page} = req.query;
        if (isInvalidString(per) || isInvalidString(page)) {
            next(appError(400, 'failed', '欄位未填寫正確', next))
            return;
        }
        const pageSize = parseInt(per)
        const currentPage = parseInt(page)
        if (isInvalidInteger(pageSize) ||
            isInvalidInteger(currentPage)) {
            next(appError(400, 'failed', '欄位未填寫正確', next))
            return;
        }
        const coachRepo = dataSource.getRepository('Coach')
        const result = await coachRepo.find({
            skip: (currentPage-1)*pageSize,
            take: pageSize,
            select: {
                id: true,
                User: {
                    name: true
                }
            },
            relations: ['User']
        }).then( coaches => coaches.map(coach => ({
                id: coach.id,
                name: coach.User.name
            })
        ))

        res.status(200).json({
            status: "success",
            data: result
        })
    } catch (err) {
        logger.error(err)
        next(err)
    }
})

//取得教練詳細資訊
router.get('/:coachId', async (req, res, next) => {
    try {
        const {coachId} = req.params;
        if (isInvalidString(coachId) || isInvalidUuid(coachId)) {
            next(appError(400, 'failed', '欄位未填寫正確', next))
            return;
        }

        const coachRepo = dataSource.getRepository('Coach')
        const matchCoach = await coachRepo.findOne({
            where: {id: coachId},
            select: {
                User: {
                    name: true,
                    role: true
                },
                id: true,
                user_id: true,
                experience_years: true,
                description: true,
                profile_image_url: true,
                createdAt: true,
                updatedAt: true
            },
            relations: ['User']
        })
        if (!matchCoach) {
            next(appError(400, 'failed', '找不到該教練', next))
            return;
        }
        res.status(200).json({
            status : "success",
            data: {
                user: {
                    name: matchCoach.User.name,
                    role: matchCoach.User.role
                },
                coach: {
                    id: matchCoach.id,
                    user_id: matchCoach.user_id,
                    experience_years: matchCoach.experience_years,
                    description: matchCoach.description,
                    profile_image_url: matchCoach.profile_image_url,
                    created_at: matchCoach.createdAt,
                    updated_at: matchCoach.updatedAt
                }
            }
        }) 
    } catch (err) {
        logger.error(err)
        next(err)
    }
})

module.exports = router