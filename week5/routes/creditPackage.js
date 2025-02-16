const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')

const logger = require('../utils/logger')("CreditPackage")
const {isInvalidString, isInvalidInteger, isInvalidUuid} = require('../utils/verify')

const repoName = 'CreditPackage'

router.get('/', async (req, res, next) => {
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
})

router.post('/', async (req, res, next) => {
    try {
        const {name, credit_amount, price} = req.body;
        if (isInvalidString(name) ||
            isInvalidInteger(credit_amount) ||
            isInvalidInteger(price)) {
            res.status(400).json({
                status: "failed",
                message: "欄位未填寫正確"
            })
            return;
        }
        const creditPackageRepo = await dataSource.getRepository(repoName);
        const existCreditPurchase = await creditPackageRepo.find({
            where: { name }
        })

        if (existCreditPurchase.length !== 0) {
            res.status(409).json({
                status: "failed",
                message: "資料重複"
            })
            return;
        }

        const newCreditPurchase = await creditPackageRepo.create({
            name,
            credit_amount,
            price
        })

        const result = await creditPackageRepo.save(newCreditPurchase)
        res.status(200).json({
            status: "success",
            data: result
        })
    }
    catch (err) {
        logger.err(err)
        next(err)
    }
})

router.delete('/:creditPackageId', async (req, res, next) => {
    try {
        const {creditPackageId} = req.params;
        if (isInvalidUuid(creditPackageId)) {
            res.status(400).json({
                status: "failed",
                message: "欄位未填寫正確"
            })
            return;
        }
        const creditPackageRepo = dataSource.getRepository(repoName);
        const result = creditPackageRepo.delete(creditPackageId);
        if (result.affected === 0) {
            res.status(400).json({
                status: "failed",
                message: "ID錯誤"
            })
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
})

module.exports = router
