import { pgTable, serial, timestamp, integer, boolean, doublePrecision, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { cardsTable } from "./cards";

export const scanLogsTable = pgTable("scan_logs", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").notNull().references(() => cardsTable.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  country: text("country"),
  deviceType: text("device_type"),
  browser: text("browser"),
  ratingGiven: doublePrecision("rating_given"),
  wasNegative: boolean("was_negative").notNull().default(false),
});

export const insertScanLogSchema = createInsertSchema(scanLogsTable).omit({ id: true });
export type InsertScanLog = z.infer<typeof insertScanLogSchema>;
export type ScanLog = typeof scanLogsTable.$inferSelect;
