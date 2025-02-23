const express = require('express')
const bcrypt = require('bcrypt')

const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')

const repoName = 'User'
const logger = require('../utils/logger')("User")
const generateJWT = require('../utils/generateJWT')
const auth = require('../utils/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository(repoName),
    logger
})

const {isInvalidString, 
    isInvalidName, isInvalidEmail, isInvalidPassword} = require('../utils/verify')
const {errHandler} = require('../utils/errHandler')

const saltRounds = 10 //for bcrypt hash

//使用者註冊
router.post('/signup', async (req, res, next) => {
    try {
        const {name, email, password} = req.body;
        if (isInvalidString(name) || 
            isInvalidString(email) || 
            isInvalidString(password)) {
            const warnMessage = '欄位未填寫正確'
            logger.warn(warnMessage)
            res.status(400).json({
                "status" : "failed",
                "message": warnMessage
            })
            return
        }
        if (isInvalidName(name)) {
            errHandler(res, 400,"建立使用者錯誤","使用者名稱不符合規則，最少2個字，最多10個字，不可包含任何特殊符號與空白，第一個字不可為數字")
            return
        }
        if (isInvalidEmail(email)) {
            errHandler(res, 400,"建立使用者錯誤","使用者信箱不符合規則")
            return
        }
        if (isInvalidPassword(password)) {
            errHandler(res, 400, "建立使用者錯誤","密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字")
            return
        }
        const userRepo = dataSource.getRepository(repoName)
        const existEmail = await userRepo.findOne({
            where: { email }
        })
        if (existEmail) {
            errHandler(res, 409,"建立使用者錯誤","Email已被使用")
            return
        }
        const salt = await bcrypt.genSalt(saltRounds)
        const hashPassword = await bcrypt.hash(password, salt)
        const newUser = userRepo.create({
            name,
            email,
            role: 'USER',
            password: hashPassword
        })
        const savedUser = await userRepo.save(newUser)
        logger.info('新建立的使用者ID:', savedUser.id)
        res.status(201).json({
            status: "success",
            data: {
                user: {
                    id: savedUser.id,
                    name: savedUser.name
                }
            }
        })
    } catch (err) {
        logger.error('建立使用者錯誤',err)
        next(err)
    }
})

//使用者登入
router.post('/login', async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (isInvalidString(email) ||
            isInvalidString(password)) {
            const warnMessage = '欄位未填寫正確'
            logger.warn(warnMessage)
            res.status(400).json({
                "status" : "failed",
                "message": warnMessage
            })
            return
        }

        if (isInvalidEmail(email)) {
            errHandler(res, 400,"登入使用者錯誤","使用者信箱不符合規則")
            return
        }
        if (isInvalidPassword(password)) {
            errHandler(res, 400, "登入使用者錯誤","密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字")
            return
        }
        // if (isInvalidEmail(email) ||
        //     isInvalidPassword(password)) {
        //     errHandler(res, 400, "登入使用者錯誤","使用者不存在或密碼輸入錯誤")
        //     return
        // }
        const userRepo = dataSource.getRepository(repoName)
        const existUser = await userRepo.findOne({
            select: ['id','name','password'],
            where: { email }
        })
        console.log(existUser);
        if (!existUser) {
            errHandler(res, 400,"登入使用者錯誤","使用者不存在或密碼輸入錯誤")
            return
        }
        const isMatch = await bcrypt.compare(password, existUser.password)
        if (!isMatch) {
            errHandler(res, 400,"登入使用者錯誤","使用者不存在或密碼輸入錯誤")
            return
        }
        const token = await generateJWT(
            {id:existUser.id},
            config.get('secret').jwtSecret,
            {expiresIn: `${config.get('secret').jwtExpireDay}`}
        )
        res.status(201).json({
            status: 'success',
            data: {
                token,
                user: {
                    name: existUser.name
                }
            }
        })
    } catch (err) {
        logger.error('登入錯誤:', err)
        next(err)
    }
})

module.exports = router