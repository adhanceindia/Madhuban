import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { rooms } from './rooms.ts'
import { users } from './users.ts'

/**
 * Persistent audit trail for every iCal sync run.
 * One row per (feed × room) tuple that was processed in a sync.
 * Read by the Channel Manager admin UI.
 */
export const icalSyncLogs = pgTable('ical_sync_logs', {
  id: serial('id').primaryKey(),
  source: text('source', {
    enum: ['booking_com', 'mmt', 'airbnb', 'agoda', 'goibibo'],
  }).notNull(),
  feed_url: text('feed_url').notNull(),
  // null means "all rooms" — the feed was fanned out to every active room
  room_id: integer('room_id').references(() => rooms.id),
  started_at: timestamp('started_at', { withTimezone: true }).notNull(),
  finished_at: timestamp('finished_at', { withTimezone: true }),
  status: text('status', { enum: ['success', 'error', 'partial'] }).notNull(),
  synced_count: integer('synced_count').notNull().default(0),
  removed_count: integer('removed_count').notNull().default(0),
  error: text('error'),
  triggered_by: text('triggered_by', { enum: ['cron', 'manual'] }).notNull(),
  triggered_by_user_id: integer('triggered_by_user_id').references(
    () => users.id,
  ),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type IcalSyncLog = typeof icalSyncLogs.$inferSelect
export type NewIcalSyncLog = typeof icalSyncLogs.$inferInsert
export type IcalSyncStatus = IcalSyncLog['status']
export type IcalSyncTrigger = IcalSyncLog['triggered_by']
