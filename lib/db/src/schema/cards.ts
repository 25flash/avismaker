import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { businessProfilesTable } from "./business-profiles";

export const cardsTable = pgTable("cards", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  status: text("status").notNull().default("inactive"),
  platform: text("platform"),
  targetUrl: text("target_url"),
  businessProfileId: integer("business_profile_id").references(() => businessProfilesTable.id, { onDelete: "set null" }),
  ownerId: integer("owner_id").references(() => usersTable.id, { onDelete: "set null" }),
  scanCount: integer("scan_count").notNull().default(0),
  smartReviewEnabled: boolean("smart_review_enabled").notNull().default(false),
  negativeAlertEnabled: boolean("negative_alert_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
});

export const insertCardSchema = createInsertSchema(cardsTable).omit({ id: true, createdAt: true });
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cardsTable.$inferSelect;
