import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const supportMessagesTable = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  messageText: text("message_text").notNull(),
  sentDate: timestamp("sent_date", { withTimezone: true }).notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
  repliedByAdmin: text("replied_by_admin"),
  replyDate: timestamp("reply_date", { withTimezone: true }),
});

export const insertSupportMessageSchema = createInsertSchema(supportMessagesTable).omit({ id: true, sentDate: true });
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type SupportMessage = typeof supportMessagesTable.$inferSelect;
