import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, reviewRepliesTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { GenerateAiReplyBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const PLAN_AI_ACCESS = ["premium", "pro", "business"];

async function generateReplyWithAI(review: string, platform: string, tone?: string): Promise<string> {
  const toneInstruction = tone ? `Use a ${tone} tone.` : "Use a professional and empathetic tone.";
  const prompt = `You are a customer service expert. Generate a professional reply to the following ${platform} review. ${toneInstruction} Keep it concise (2-4 sentences), personalized, and constructive. Do not include a subject line or salutation.

Review: "${review}"

Reply:`;

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return generateFallbackReply(review, platform);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return generateFallbackReply(review, platform);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content?.trim() ?? generateFallbackReply(review, platform);
  } catch (err) {
    logger.error({ err }, "OpenAI API error, using fallback");
    return generateFallbackReply(review, platform);
  }
}

function generateFallbackReply(review: string, platform: string): string {
  const isNegative = review.toLowerCase().includes("bad") || review.toLowerCase().includes("terrible") || review.toLowerCase().includes("worst") || review.toLowerCase().includes("disappoint");

  if (isNegative) {
    return `Thank you for taking the time to share your experience with us. We're truly sorry to hear that your visit didn't meet your expectations. We take all feedback seriously and would love the opportunity to make things right. Please don't hesitate to reach out to us directly so we can address your concerns personally.`;
  }

  return `Thank you so much for your wonderful review! We're thrilled to hear you had a great experience with us. Your feedback means the world to our team and motivates us to keep delivering excellent service. We look forward to welcoming you back soon!`;
}

router.post("/ai/generate-reply", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  if (!PLAN_AI_ACCESS.includes(req.userPlan ?? "free")) {
    res.status(403).json({ error: "AI Reply is available on Premium, Pro, and Business plans. Please upgrade your subscription." });
    return;
  }

  const parsed = GenerateAiReplyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { originalReview, platform, tone } = parsed.data;
  const negativeKeywords = ["bad", "terrible", "worst", "awful", "horrible", "disappointed", "poor", "never again", "1 star", "1/5"];
  const wasNegative = negativeKeywords.some(kw => originalReview.toLowerCase().includes(kw));

  const generatedReply = await generateReplyWithAI(originalReview, platform, tone ?? undefined);

  const [reply] = await db.insert(reviewRepliesTable).values({
    userId: req.userId!,
    originalReview,
    generatedReply,
    platform,
    wasNegative,
  }).returning();

  res.json({
    reply: generatedReply,
    wasNegative,
    id: reply.id,
  });
});

router.get("/ai/reply-history", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const replies = await db.select().from(reviewRepliesTable)
    .where(eq(reviewRepliesTable.userId, req.userId!));

  replies.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  res.json(replies.map(r => ({
    id: r.id,
    originalReview: r.originalReview,
    generatedReply: r.generatedReply,
    platform: r.platform,
    wasNegative: r.wasNegative,
    createdAt: r.createdAt.toISOString(),
  })));
});

export default router;
