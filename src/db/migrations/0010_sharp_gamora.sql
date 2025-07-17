CREATE TABLE "last_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_fingerprint" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"user_display_name" varchar(100) NOT NULL,
	"user_avatar_url" text,
	"last_used_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "last_sessions_device_fingerprint_unique" UNIQUE("device_fingerprint")
);
--> statement-breakpoint
ALTER TABLE "user_accounts" ADD COLUMN "last_used_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "last_sessions" ADD CONSTRAINT "last_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;