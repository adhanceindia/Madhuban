ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'customer';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "folder" text DEFAULT 'General' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;