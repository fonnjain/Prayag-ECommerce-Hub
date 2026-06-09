import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const dealersTable = pgTable("dealers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  gstNumber: text("gst_number"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dealerSchemesTable = pgTable("dealer_schemes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discount: numeric("discount", { precision: 5, scale: 2 }).notNull(),
  validUntil: text("valid_until").notNull(),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDealerSchema = createInsertSchema(dealersTable).omit({ id: true, createdAt: true });
export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type Dealer = typeof dealersTable.$inferSelect;
