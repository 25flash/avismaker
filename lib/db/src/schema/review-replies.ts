import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const reviewRepliesTable = pgTable("review_replies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  originalReview: text("original_review").notNull(),
  generatedReply: text("generated_reply").notNull(),
  platform: text("platform").notNull(),
  wasNegative: boolean("was_negative").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReviewReplySchema = createInsertSchema(reviewRepliesTable).omit({ id: true, createdAt: true });
export type InsertReviewReply = z.infer<typeof insertReviewReplySchema>;
export type ReviewReply = typeof reviewRepliesTable.$inferSelect;
