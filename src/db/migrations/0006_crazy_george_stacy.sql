ALTER TABLE "uploads" ADD COLUMN "game_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" DROP COLUMN "game_name";--> statement-breakpoint
ALTER TABLE "uploads" DROP COLUMN "platform";--> statement-breakpoint
ALTER TABLE "uploads" DROP COLUMN "release_year";