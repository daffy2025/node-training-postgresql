const { dataSource } = require('../db/data-source')

const appError = require('../utils/appError')
const logger = require('../utils/logger')("creditPackage")
const {isInvalidString, isInvalidInteger, isInvalidUuid} = require('../utils/verify')

const repoName = 'CreditPackage'

//使用者購買方案
const pruchasePackage = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { creditPackageId } = req.params;
        if (isInvalidUuid(creditPackageId)) {
            appError(400, 'failed', '欄位未填寫正確')
            return;
        }

        const creditPackageRepo = dataSource.getRepository(repoName);
        const findCreditPackage = await creditPackageRepo.findOne({
            where:{
                id:creditPackageId
            }
        });
        if (!findCreditPackage) {
            appError(400, 'failed', 'ID錯誤')
            return;
        }

        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
        const newPurchase = creditPurchaseRepo.create({
            user_id: id,
            credit_package_id: creditPackageId,
            purchased_credits: findCreditPackage.credit_amount,
            price_paid: findCreditPackage.price,
            purchaseAt: new Date().toISOString()
        })
        await creditPurchaseRepo.save(newPurchase)
        res.status(200).json({
            status: "success",
            data: null
        })
    }
    catch (err) {
        logger.error(err)
        next(err)
    }
}

//取得購買方案列表
const getCoursePackageList = async (req, res, next) => {
    try {
        const packages = await dataSource.getRepository(repoName).find({
            select: ['id','name','credit_amount','price']
        })
        res.status(200).json({
            status: 'success',
            data: packages
        })
    } catch (err) {
        logger.error(err)
        next(err)
    }
}

//新增購買方案
const addCoursePackage = async (req, res, next) => {
    try {
        const {name, credit_amount, price} = req.body;
        if (isInvalidString(name) ||
            isInvalidInteger(credit_amount) ||
            isInvalidInteger(price)) {
            appError(400, 'failed', '欄位未填寫正確')
            return;
        }
        const creditPackageRepo = dataSource.getRepository(repoName);
        const existCreditPurchase = await creditPackageRepo.findOne({
            where: { name }
        })

        if (existCreditPurchase) {
            appError(409, 'failed', '資料重複')
            return;
        }

        const newCreditPurchase = creditPackageRepo.create({
            name,
            credit_amount,
            price
        })

        const result = await creditPackageRepo.save(newCreditPurchase)
        res.status(200).json({
            status: "success",
            data: {
                id: result.id,
                name: result.name,
                credit_amount: result.credit_amount,
                price: result.price
            }
        })
    }
    catch (err) {
        logger.error(err)
        next(err)
    }
}

//刪除購買方案
const deleteCoursePackage = async (req, res, next) => {
    try {
        const {creditPackageId} = req.params;
        if (isInvalidUuid(creditPackageId)) {
            appError(400, 'failed', '欄位未填寫正確')
            return;
        }
        const creditPackageRepo = dataSource.getRepository(repoName);
        const result = await creditPackageRepo.delete(creditPackageId);
        if (result.affected === 0) {
            appError(400, 'failed', 'ID錯誤')
            return;
        }
        res.status(200).json({
            status: "success"
        })
    }
    catch (err) {
        logger.error(err)
        next(err)
    }
}

module.exports = {
    pruchasePackage,
    getCoursePackageList,
    addCoursePackage,
    deleteCoursePackage
}