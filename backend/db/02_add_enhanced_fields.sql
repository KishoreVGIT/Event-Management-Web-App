ALTER TABLE "events" ADD COLUMN "capacity" INTEGER;
ALTER TABLE "events" ADD COLUMN "location" VARCHAR(500);
ALTER TABLE "events" ADD COLUMN "category" VARCHAR(100);
ALTER TABLE "events" ADD COLUMN "image_url" VARCHAR(500);
CREATE INDEX "events_category_idx" ON "events"("category");
COMMENT ON COLUMN "events"."capacity" IS 'Maximum number of attendees. NULL means unlimited capacity.';