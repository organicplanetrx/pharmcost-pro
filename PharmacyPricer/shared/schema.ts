import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  portalUrl: text("portal_url").notNull(),
  isActive: boolean("is_active").default(true),
});

export const credentials = pgTable("credentials", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  username: text("username").notNull(),
  password: text("password").notNull(), // In production, this should be encrypted
  isActive: boolean("is_active").default(true),
  lastValidated: timestamp("last_validated"),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  ndc: text("ndc").unique(),
  packageSize: text("package_size"),
  strength: text("strength"),
  dosageForm: text("dosage_form"),
});

export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  searchTerm: text("search_term").notNull(),
  searchType: text("search_type").notNull(), // 'name', 'ndc', 'generic'
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  resultCount: integer("result_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const searchResults = pgTable("search_results", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").references(() => searches.id),
  medicationId: integer("medication_id").references(() => medications.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  availability: text("availability"), // 'available', 'limited', 'out_of_stock'
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(), // 'search', 'export', 'login', 'batch_upload'
  status: text("status").notNull(), // 'success', 'failure', 'warning'
  description: text("description").notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  searchId: integer("search_id").references(() => searches.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
});

export const insertCredentialSchema = createInsertSchema(credentials).omit({
  id: true,
  lastValidated: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
});

export const insertSearchSchema = createInsertSchema(searches).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertSearchResultSchema = createInsertSchema(searchResults).omit({
  id: true,
  lastUpdated: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type Credential = typeof credentials.$inferSelect;
export type InsertCredential = z.infer<typeof insertCredentialSchema>;

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;

export type Search = typeof searches.$inferSelect;
export type InsertSearch = z.infer<typeof insertSearchSchema>;

export type SearchResult = typeof searchResults.$inferSelect;
export type InsertSearchResult = z.infer<typeof insertSearchResultSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Extended types for API responses
export type SearchWithResults = Search & {
  results: (SearchResult & {
    medication: Medication;
  })[];
};

export type MedicationSearchResult = {
  medication: Medication;
  cost: string;
  availability: string;
  vendor: string;
};
