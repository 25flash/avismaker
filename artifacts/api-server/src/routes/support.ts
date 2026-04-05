import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, supportMessagesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

function formatMessage(msg: typeof supportMessagesTable.$inferSelect) {
  return {
    id: msg.id,
    senderId: msg.senderId,
    subject: msg.subject,
    category: msg.category,
    messageText: msg.messageText,
    sentDate: msg.sentDate.toISOString(),
    isRead: msg.isRead,
    repliedByAdmin: msg.repliedByAdmin,
    replyDate: msg.replyDate?.toISOString() ?? null,
  };
}

router.get("/support/messages", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const messages = await db.select().from(supportMessagesTable).where(eq(supportMessagesTable.senderId, req.userId!));
  messages.sort((a, b) => b.sentDate.getTime() - a.sentDate.getTime());
  res.json(messages.map(formatMessage));
});

router.post("/support/messages", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const body = req.body ?? {};
  const text = ((body.message ?? body.messageText ?? "") as string).trim();
  if (!text) {
    res.status(400).json({ error: "Message text is required" });
    return;
  }

  const [msg] = await db.insert(supportMessagesTable).values({
    senderId: req.userId!,
    subject: ((body.subject ?? "") as string).trim(),
    category: (body.category as string) || "general",
    messageText: text,
  }).returning();

  res.status(201).json(formatMessage(msg));
});

export default router;
