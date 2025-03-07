const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: 'CourseBooking',
    tableName: 'COURSE_BOOKING',
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
        course_id: {
            type: 'uuid',
            nullable: false
        },
        bookingdAt: {
            type: 'timestamp',
            createDate: true,
            name: 'booking_at',
            nullable: false
        },
        status: {
            type: 'varchar',
            length: 20,
            nullable: true
        },
        joinAt: {
            type: 'timestamp',
            createDate: true,
            name: 'join_at',
            nullable: true
        },
        leaveAt: {
            type: 'timestamp',
            name: 'leave_at',
            nullable: true
        },
        cancelledAt: {
            type: 'timestamp',
            name: 'cancelled_at',
            nullable: true
        },
        cancellation_reason: {
            type: 'varchar',
            length: 255,
            nullable: true
        },
        createdAt: {
            type: 'timestamp',
            name: 'created_at',
            createDate: true,
            nullable: false
        },
    },
    relations: {
        User: {
            target: 'User',
            type: 'many-to-one',
            inverseSide: 'CouserBooking',
            joinColumn: {
                name: 'user_id',
                referenceColumnName: 'id',
                foreignKeyConstraintName: 'courseBookinge_user_id_fk'
            }
        },
        Course: {
            target: 'Course',
            type: 'many-to-one',
            inverseSide: 'CouserBooking',
            joinColumn: {
                name: 'course_id',
                referenceColumnName: 'id',
                foreignKeyConstraintName: 'courseBooking_course_id_fk'
            }
        },
    }})