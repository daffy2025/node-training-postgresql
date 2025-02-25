const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: 'CreditPurchase',
    tableName: 'CREDIT_PURCHASE',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
            nullable: false,
            unique: true
        },
        user_id: {
            type: 'uuid',
            nullable: false
        },
        credit_package_id: {
            type: 'uuid',
            nullable: false
        },
        purchased_credits: {
            type: 'integer',
            nullable: false
        },
        price_paid: {
            type: 'numeric',
            precision: 10,
            scale: 2,
            nullable: false
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
            name: 'created_at',
            nullable: false
        },
        purchaseAt: {
            type: 'timestamp',
            name: 'purchase_at',
            nullable: false
        }
    },
    relations: {
        User: {
            target: 'User',
            type: 'many-to-one',
            inverseSide: 'CreditPurchase',
            joinColumn: {
                name: 'user_id',
                referenceColumnName: 'id',
                foreignKeyConstraintName: 'creditPurchase_user_id_fk'
            }
        },
        CreditPackage: {
            target: 'CreditPackage',
            type: 'many-to-one',
            inverseSide: 'CreditPurchase',
            joinColumn: {
                name: 'credit_package_id',
                referenceColumnName: 'id',
                foreignKeyConstraintName: 'creditPurchase_creditPackage_id_fk'
            }
        },
    }
})