-- 0003_channel_manager.sql
-- Adds the ical_sync_logs table backing the Channel Manager sync-history UI.
--
-- Note: the `bookings.source` enum extension (adding 'airbnb', 'agoda', 'goibibo')
-- is a TypeScript-only change. Drizzle's inline `text({ enum: [...] })` columns
-- compile to plain `text` in Postgres with NO CHECK constraint, so no ALTER TYPE
-- or backfill is needed — existing rows are unaffected and new source values
-- write without error. See db/schema/bookings.ts.
CREATE TABLE "ical_sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"feed_url" text NOT NULL,
	"room_id" integer,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text NOT NULL,
	"synced_count" integer DEFAULT 0 NOT NULL,
	"removed_count" integer DEFAULT 0 NOT NULL,
	"error" text,
	"triggered_by" text NOT NULL,
	"triggered_by_user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "ical_sync_logs" ADD CONSTRAINT "ical_sync_logs_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ical_sync_logs" ADD CONSTRAINT "ical_sync_logs_triggered_by_user_id_users_id_fk" FOREIGN KEY ("triggered_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- RLS: keep the new table default-denied for the public anon/authenticated roles
-- (same posture as every other table — see 9999_enable_rls.sql). The app connects
-- as the table OWNER via DATABASE_URI and bypasses RLS.
ALTER TABLE public.ical_sync_logs ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON public.ical_sync_logs FROM anon, authenticated;