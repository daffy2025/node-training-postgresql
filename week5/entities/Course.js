const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: 'Course',
    tableName: 'COURSE',
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
            nullable: false,
            foreignKey: {
                name: 'course_user_id_fkey',
                columnNames: ['user_id'],
                referenceTableName: 'User',
                referenceColumnNames: ['id']
            }
        },
        skill_id: {
            type: 'uuid',
            nullable: false,
            foreignKey: {
                name: 'course_skill_id_fkey',
                columnNames: ['skill_id'],
                referenceTableName: 'Skill',
                referenceColumnNames: ['id']
            }
        },
        name: {
            type: 'varchar',
            length: 100,
            nullable: false
        },
        description: {
            type: 'text',
            nullable: false
        },
        start_at: {
            type: 'timestamp',
            nullable: false
        },
        end_at: {
            type: 'timestamp',
            nullable: false
        },
        max_participants: {
            type: 'integer',
            nullable: false
        },
        meeting_url: {
            type: 'varchar',
            length: 2048,
            nullable: false
        },
        createdAt: {
            type: 'timestamp',
            nullable: false,
            name: 'created_at',
            createDate: true,
            nullable: false
        },
        updatedAt: {
            type: 'timestamp',
            nullable: false,
            name: 'updated_at',
            updateDate: true,
            nullable: false
        }
    }
})