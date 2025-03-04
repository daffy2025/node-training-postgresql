const { dataSource } = require('../db/data-source')

const appError = require('../utils/appError')
const logger = require('../utils/logger')("user")
const {isInvalidString,
    isInvalidName, isInvalidEmail, isInvalidPassword} = require('../utils/verify')

const repoName = 'User'

const config = require('../config/index')
const saltRounds = config.get('secret').saltRounds || 10 //for bcrypt hash

const bcrypt = require('bcrypt')
const generateJWT = require('../utils/generateJWT')

//使用者註冊
const userSingup = async (req, res, next) => {
    try {
        const {name, email, password} = req.body;
        if (isInvalidString(name) || 
            isInvalidString(email) || 
            isInvalidString(password)) {
            const warnMessage = '欄位未填寫正確'
            logger.warn(warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        if (isInvalidName(name)) {
            const warnMessage = '使用者名稱不符合規則，最少2個字，最多10個字，不可包含任何特殊符號與空白，第一個字不可為數字'
            logger.warn(`建立使用者錯誤：${warnMessage}`)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        if (isInvalidEmail(email)) {
            const warnMessage = '使用者信箱不符合規則'
            logger.warn(`建立使用者錯誤：${warnMessage}`)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        if (isInvalidPassword(password)) {
            const warnMessage = '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
            logger.warn(`建立使用者錯誤：${warnMessage}`)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        const userRepo = dataSource.getRepository(repoName)
        const existEmail = await userRepo.findOne({
            where: { email }
        })
        if (existEmail) {
            const warnMessage = 'Email已被使用'
            logger.warn(`建立使用者錯誤：${warnMessage}`)
            next(appError(409, 'failed', warnMessage, next))
            return
        }
        const salt = await bcrypt.genSalt(parseInt(saltRounds))
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
}

//使用者登入
const userSingIn = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (isInvalidString(email) ||
            isInvalidString(password)) {
            const warnMessage = '欄位未填寫正確'
            logger.warn(warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }

        if (isInvalidEmail(email)) {
            const warnMessage = '使用者信箱不符合規則'
            logger.warn('登入錯誤',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        if (isInvalidPassword(password)) {
            const warnMessage = '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
            logger.warn('登入錯誤',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        const userRepo = dataSource.getRepository(repoName)
        const existUser = await userRepo.findOne({
            select: ['id','name','password'],
            where: { email }
        })
        if (!existUser) {
            const warnMessage = '使用者不存在或密碼輸入錯誤'
            logger.warn('登入錯誤',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        const isMatch = await bcrypt.compare(password, existUser.password)
        if (!isMatch) {
            const warnMessage = '使用者不存在或密碼輸入錯誤'
            logger.warn('登入錯誤',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
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
}

//取得個人資料
const userGetProfile = async (req, res, next) => {
    try {
        const { id } = req.user
        const userRepo = dataSource.getRepository(repoName)
        const getUser = await userRepo.findOne({
            select: ['email','name'],
            where: { id }
        })
        if (!getUser) {
            next(appError(400, 'failed', '欄位未填寫正確', next))
            return;
        }
        res.status(200).json({
            status: 'success',
            data: getUser
        })
    } catch (err) {
        logger.error('取得使用者資料錯誤:',err)
        next(err)
    }
}

//更新個人資料
const editUserProfile = async (req, res, next) => {
    try {
        const { id } = req.user
        const {name} = req.body;
        if (isInvalidString(name)) {
            const warnMessage = '欄位未填寫正確'
            logger.warn(warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        if (isInvalidName(name)) {
            const warnMessage = '使用者名稱不符合規則，最少2個字，最多10個字，不可包含任何特殊符號與空白，第一個字不可為數字'
            logger.warn(`更新使用者錯誤：${warnMessage}`)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        const userRepo = dataSource.getRepository(repoName)
        const getUser = await userRepo.findOne({
            select: ['name'],
            where: { id }
        })
        if (!getUser) {
            next(appError(400, 'failed', '無此使用者', next))
            return;
        }
        if (name === getUser.name) {
            next(appError(400, 'failed', '使用者名稱未變更', next))
            return;
        }

        const updateUser = await userRepo.update({
            id
        }, {
            name
        })
        if (updateUser.affected === 0) {
            const warnMessage = '更新使用者失敗'
            logger.warn('更新使用者錯誤：', warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        const updatedUser = await userRepo.findOne({
            select: ['name'],
            where: { id }
        })
        res.status(201).json({
            status: 'success',
            data: updatedUser
        })
    } catch (err) {
        logger.error('更新使用者錯誤:', err)
        next(err)
    }
}

const changeUserPassword = async (req, res, next) => {
    try {
        const { id } = req.user
        const {password, new_password, confirm_new_password} = req.body;
        if (isInvalidString(password) ||
            isInvalidString(new_password) ||
            isInvalidString(confirm_new_password)) {
            const warnMessage = '欄位未填寫正確'
            logger.warn(warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }

        if (isInvalidPassword(password) ||
            isInvalidPassword(new_password) ||
            isInvalidPassword(confirm_new_password)) {
            const warnMessage = '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
            logger.warn('更新密碼錯誤',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        if (password === new_password) {
            const warnMessage = '新密碼不能與舊密碼相同'
            logger.warn('更新密碼錯誤',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        if (new_password !== confirm_new_password) {
            const warnMessage = '新密碼與驗證新密碼不一致'
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        const userRepo = dataSource.getRepository(repoName)
        const existUser = await userRepo.findOne({
            select: ['password'],
            where: { id }
        })
        if (!existUser) {
            const warnMessage = '使用者不存在'
            logger.warn('更新密碼錯誤',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        const isMatch = await bcrypt.compare(password, existUser.password)
        if (!isMatch) {
            const warnMessage = '密碼輸入錯誤'
            logger.warn('更新密碼錯誤',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        const salt = await bcrypt.genSalt(parseInt(saltRounds))
        const hashPassword = await bcrypt.hash(new_password, salt)
        const newUser = userRepo.update({
            id,
        },{
            name: existUser.name,
            email: existUser.email,
            role: existUser.role,
            password: hashPassword
        })
        if ((await newUser).affected === 0) {
            const warnMessage = '更新密碼失敗'
            logger.warn('更新密碼錯誤',warnMessage)
            next(appError(400, 'failed', warnMessage, next))
            return
        }
        res.status(201).json({
            status: "success",
            data: null
        })
    } catch (err) {
        logger.error('更新密碼錯誤:', err)
        next(err)
    }
}


//取得使用者已購買的方案列表
const getPurchasedPackageList = async (req, res, next) => {
    try {
        const { id } = req.user
        //SELECT
        // CreditPurchase.purchased_credits,
        // CreditPurchase.price_paid,
        // CreditPurchase.purchaseAt,
        // (SELECT CreditPackage.name FROM CreditPackage INNER JOIN CreditPurchase ON CreditPurchase.credit_package_id = CreditPackage.id)
        //FROM CreditPurchase
        //INNER JOIN User
        //ON CreditPurchase.user_id = USER.id

        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
        const creditPurchases = await creditPurchaseRepo
            .createQueryBuilder("CreditPurchase")
            .innerJoinAndSelect("CreditPurchase.User", "User", "CreditPurchase.user_id = User.id AND User.id = :id", {id})
            .innerJoinAndSelect("CreditPurchase.CreditPackage", "CreditPackage")
            .select([
                "CreditPurchase.purchased_credits AS purchased_credits",
                "CreditPurchase.price_paid AS price_paid",
                "CreditPackage.name AS name",
                "CreditPurchase.purchaseAt AS purchase_at" //but get createdAt ?
            ])
            .getRawMany();

        res.status(200).json({
            status: 'success',
            data: creditPurchases
        })
    } catch (err) {
        logger.error(err)
        next(err)
    }
}

module.exports = {
    userSingup,
    userSingIn,
    userGetProfile,
    editUserProfile,
    changeUserPassword,
    getPurchasedPackageList
}