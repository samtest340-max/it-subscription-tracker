import { boolean, date, integer, jsonb, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

export const websiteUptimeStatus = pgTable('website_uptime_status', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  websiteName: text('website_name').notNull(),
  websiteUrl: text('website_url').notNull(),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  httpStatus: integer('http_status'),
  responseTimeMs: integer('response_time_ms'),
  checkedAt: timestamp('checked_at', { withTimezone: true }).notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userWebsiteUrlIdx: uniqueIndex('website_uptime_status_user_url_idx').on(table.userId, table.websiteUrl),
}))

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  softwareName: text('software_name').notNull(),
  vendor: text('vendor').notNull().default(''),
  category: text('category').notNull(),
  ownerDepartment: text('owner_department').notNull().default(''),
  pocName: text('poc_name').notNull().default(''),
  pocEmail: text('poc_email').notNull().default(''),
  startDate: date('start_date', { mode: 'string' }).notNull(),
  durationDays: integer('duration_days').notNull(),
  renewalCost: numeric('renewal_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  expirationDate: date('expiration_date', { mode: 'string' }).notNull(),
  currency: text('currency').notNull().default('NGN'),
  autoRenewal: boolean('auto_renewal').notNull().default(false),
  seats: integer('seats').notNull().default(1),
  licenseReference: text('license_reference'),
  vendorLink: text('vendor_link'),
  notes: text('notes'),
  cancelled: boolean('cancelled').notNull().default(false),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cameras = pgTable('cameras', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  station: text('station').notNull(),
  cameraName: text('camera_name').notNull(),
  cameraId: text('camera_id').notNull(),
  location: text('location').notNull(),
  onlineThresholdMinutes: integer('online_threshold_minutes').notNull().default(10),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  status: text('status').notNull().default('offline'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cameraReadings = pgTable('camera_readings', {
  id: uuid('id').defaultRandom().primaryKey(),
  cameraId: uuid('camera_id').notNull(),
  observedAt: timestamp('observed_at', { withTimezone: true }).notNull(),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cameraIncidents = pgTable('camera_incidents', {
  id: uuid('id').defaultRandom().primaryKey(),
  cameraId: uuid('camera_id').notNull(),
  incidentType: text('incident_type').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  acknowledgedBy: text('acknowledged_by'),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const backupEvents = pgTable('backup_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  backupType: text('backup_type').notNull(),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  status: text('status').notNull().default('pending'),
  provider: text('provider').notNull().default('n8n'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const notificationDeliveries = pgTable('notification_deliveries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  notificationType: text('notification_type').notNull(),
  recipientCount: integer('recipient_count').notNull().default(0),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
