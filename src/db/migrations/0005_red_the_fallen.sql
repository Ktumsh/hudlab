ALTER TABLE "uploads" ADD COLUMN "public_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_public_id_unique" UNIQUE("public_id");