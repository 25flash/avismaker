import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, supportMessagesTable } from "@workspace/db";
import { requireAuth, requireAdmin, type AuthRequest } from "../lib/auth";
import {
  CreateSupportMessageBody,
  ReplyToSupportMessageParams,
  ReplyToSupportMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatMessage(msg: typeof supportMessagesTable.$inferSelect) {
  return {
    id: msg.id,
    senderId: msg.senderId,
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
  const parsed = CreateSupportMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [msg] = await db.insert(supportMessagesTable).values({
    senderId: req.userId!,
    messageText: parsed.data.messageText,
  }).returning();

  res.status(201).json(formatMessage(msg));
});

export default router;
