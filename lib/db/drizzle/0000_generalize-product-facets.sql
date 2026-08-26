ALTER TABLE "products" ADD COLUMN "sub_category" text;
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "size_label" text;
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "series" text;
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "collection" text;
--> statement-breakpoint
CREATE INDEX "products_category_sub_category_idx" ON "products" USING btree ("category_id", "sub_category");
--> statement-breakpoint
CREATE INDEX "products_category_series_idx" ON "products" USING btree ("category_id", "series");