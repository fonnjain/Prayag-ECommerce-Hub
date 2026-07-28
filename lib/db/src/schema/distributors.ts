import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const distributorsTable = pgTable("distributors", {
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
  territory: text("territory"),
  distributorCode: text("distributor_code"),
  dateCreated: text("date_created"),
  createdBy: text("created_by"),
  customerType: text("customer_type"),
  alternateContact1: text("alternate_contact_1"),
  contact1Dob: text("contact_1_dob"),
  contactPerson2: text("contact_person_2"),
  contactNumber2: text("contact_number_2"),
  alternateContact2: text("alternate_contact_2"),
  contact2Dob: text("contact_2_dob"),
  anniversaryDate: text("anniversary_date"),
  category: text("category"),
  address: text("address"),
  area: text("area"),
  authorisedDate: text("authorised_date"),
  profileImgUrl: text("profile_img_url"),
  visitingCardUrl: text("visiting_card_url"),
  passbookImgUrl: text("passbook_img_url"),
  assignedSegment: text("assigned_segment"),
  assignedUser: text("assigned_user"),
  customerBranding: text("customer_branding"),
  aadharNo: text("aadhar_no"),
  aadharFrontUrl: text("aadhar_front_url"),
  aadharBackUrl: text("aadhar_back_url"),
  panNo: text("pan_no"),
  panImageUrl: text("pan_image_url"),
  bankName: text("bank_name"),
  accountHolderName: text("account_holder_name"),
  accountNo: text("account_no"),
  ifscCode: text("ifsc_code"),
  bankPassbookUrl: text("bank_passbook_url"),
  assignDistributor: text("assign_distributor"),
  accountStatus: text("account_status"),
  annualTarget: numeric("annual_target", { precision: 15, scale: 2 }),
  creditLimit: numeric("credit_limit", { precision: 15, scale: 2 }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const distributorSchemesTable = pgTable("distributor_schemes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discount: numeric("discount", { precision: 5, scale: 2 }).notNull(),
  minOrderValue: numeric("min_order_value", { precision: 12, scale: 2 }),
  validUntil: text("valid_until").notNull(),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDistributorSchema = createInsertSchema(distributorsTable).omit({ id: true, createdAt: true });
export type InsertDistributor = z.infer<typeof insertDistributorSchema>;
export type Distributor = typeof distributorsTable.$inferSelect;
