import { pgTable, text, integer, boolean, timestamp, unique, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const questTypeEnum = pgEnum('quest_type', [
  'CLICK_COUNT', 'CHEST_OPEN', 'LEVEL_REACH', 'XP_EARN',
])

export const questTemplates = pgTable('quest_templates', {
  id:          text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title:       text('title').notNull(),
  description: text('description').notNull(),
  type:        questTypeEnum('type').notNull(),
  targetValue: integer('target_value').notNull(),
  rewardXp:    integer('reward_xp').notNull(),
  rewardChestTierId: text('reward_chest_tier_id'),
})

export const questProgress = pgTable('quest_progress', {
  id:              text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:          text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  questTemplateId: text('quest_template_id').notNull().references(() => questTemplates.id),
  currentValue:    integer('current_value').default(0).notNull(),
  isComplete:      boolean('is_complete').default(false).notNull(),
  completedAt:     timestamp('completed_at'),
  assignedAt:      timestamp('assigned_at').defaultNow().notNull(),
}, (t) => ({
  uniqueUserQuestDay: unique().on(t.userId, t.questTemplateId, t.assignedAt),
}))

export const questTemplatesRelations = relations(questTemplates, ({ many }) => ({
  progress: many(questProgress),
}))

export const questProgressRelations = relations(questProgress, ({ one }) => ({
  user: one(users, {
    fields: [questProgress.userId],
    references: [users.id],
  }),
  quest: one(questTemplates, {
    fields: [questProgress.questTemplateId],
    references: [questTemplates.id],
  }),
}))
