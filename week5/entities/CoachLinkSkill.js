const { EntitySchema, JoinColumn } = require('typeorm')

module.exports = new EntitySchema({
    name: 'CoachLinkSkill',
    tableName: 'COACH_LINK_SKILL',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid'
        },
        coach_id: {
            type: 'uuid',
            nullable: false,
        },
        skill_id: {
            type: 'uuid',
            nullable: false,
        },
        createdAt: {
            type: 'timestamp',
            name: 'created_at',
            createDate: true,
            nullable: false
        }
    },
    relations: {
        Coach: {
            target: 'Coach',
            type: 'many-to-one',
            inverseSide: 'CoachLinkSkill',
            joinColumn: {
                name: 'coach_id',
                referenceColumnName: 'id',
                foreignKeyConstraintName: 'coachlinkskill_coach_id_fk'
            }
        },
        Skill: {
            target: 'Skill',
            type: 'many-to-one',
            inverseSide: 'CoachLinkSkill',
            joinColumn: {
                name: 'skill_id',
                referenceColumnName: 'id',
                foreignKeyConstraintName: 'coachlinkskill_skill_id_fk'
            }
        }
    }
})