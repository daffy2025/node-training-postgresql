const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')

//取得課程列表
router.get('/', async (req, res, next) => {
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
})

module.exports = router