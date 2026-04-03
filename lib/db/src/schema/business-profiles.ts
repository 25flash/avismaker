import { pgTable, text, serial, timestamp, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const businessProfilesTable = pgTable("business_profiles", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  category: text("category"),
  customBannerText: text("custom_banner_text"),
  customBannerColor: text("custom_banner_color"),
  showPoweredBy: boolean("show_powered_by").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBusinessProfileSchema = createInsertSchema(businessProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
export type BusinessProfile = typeof businessProfilesTable.$inferSelect;
