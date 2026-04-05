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

IMPORTANT: Detect the language of the review and write the reply in that exact same language. If the review is in French, reply in French. If it's in Spanish, reply in Spanish. If it's in Italian, reply in Italian. Always match the language of the review.

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

function detectLanguage(text: string): "fr" | "es" | "it" | "de" | "pt" | "en" {
  const lower = text.toLowerCase();
  const fr = ["merci", "très", "bien", "super", "parfait", "excellent", "mauvais", "nul", "déçu", "désolé", "bonjour", "bonsoir", "service", "qualité", "expérience", "vraiment", "jamais", "toujours"];
  const es = ["gracias", "muy", "bueno", "excelente", "malo", "pésimo", "decepcionado", "servicio", "experiencia", "nunca", "siempre", "hola", "bien"];
  const it = ["grazie", "molto", "buono", "eccellente", "brutto", "pessimo", "deluso", "servizio", "esperienza", "sempre", "mai", "ciao", "bene"];
  const de = ["danke", "sehr", "gut", "schlecht", "enttäuscht", "service", "erfahrung", "immer", "nie", "hallo", "schön"];
  const pt = ["obrigado", "muito", "bom", "excelente", "mau", "péssimo", "decepcionado", "serviço", "experiência", "sempre", "nunca", "olá"];

  const score = (words: string[]) => words.filter(w => lower.includes(w)).length;
  const scores = { fr: score(fr), es: score(es), it: score(it), de: score(de), pt: score(pt) };
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  return (best[1] >= 2 ? best[0] : "en") as "fr" | "es" | "it" | "de" | "pt" | "en";
}

function generateFallbackReply(review: string, _platform: string): string {
  const lang = detectLanguage(review);
  const isNegative = /bad|terrible|worst|awful|horrible|disappoint|mauvais|nul|déçu|malo|pésimo|brutto|pessimo|schlecht|enttäuscht|mau|péssimo/i.test(review);

  const replies: Record<string, { positive: string; negative: string }> = {
    fr: {
      positive: "Merci beaucoup pour votre avis chaleureux ! Nous sommes ravis que votre expérience ait été à la hauteur de vos attentes. Votre retour est très précieux pour notre équipe et nous motive à continuer sur cette lancée. Nous espérons vous accueillir à nouveau très prochainement !",
      negative: "Merci de nous avoir partagé votre expérience. Nous sommes sincèrement désolés que votre visite n'ait pas répondu à vos attentes. Nous prenons chaque retour très au sérieux et aimerions beaucoup pouvoir y remédier. N'hésitez pas à nous contacter directement afin que nous puissions trouver une solution ensemble.",
    },
    es: {
      positive: "¡Muchas gracias por su maravillosa reseña! Estamos encantados de saber que tuvo una gran experiencia con nosotros. Sus comentarios son muy valiosos para nuestro equipo. ¡Esperamos volver a verle pronto!",
      negative: "Gracias por compartir su experiencia con nosotros. Lamentamos mucho que su visita no haya cumplido sus expectativas. Nos tomamos muy en serio todos los comentarios y nos encantaría poder mejorar la situación. No dude en contactarnos directamente.",
    },
    it: {
      positive: "Grazie mille per la sua splendida recensione! Siamo felici di sapere che la sua esperienza è stata positiva. Il suo feedback è molto prezioso per il nostro team. Speriamo di rivederla presto!",
      negative: "Grazie per aver condiviso la sua esperienza. Siamo sinceramente dispiaciuti che la sua visita non abbia soddisfatto le sue aspettative. Prendiamo ogni feedback molto sul serio e vorremmo avere l'opportunità di rimediare. Non esiti a contattarci direttamente.",
    },
    de: {
      positive: "Herzlichen Dank für Ihre tolle Bewertung! Wir freuen uns sehr zu hören, dass Sie bei uns eine großartige Erfahrung gemacht haben. Ihr Feedback bedeutet unserem Team sehr viel. Wir freuen uns auf Ihren nächsten Besuch!",
      negative: "Vielen Dank, dass Sie Ihre Erfahrung mit uns geteilt haben. Es tut uns sehr leid zu hören, dass Ihr Besuch Ihre Erwartungen nicht erfüllt hat. Wir nehmen jedes Feedback ernst und würden uns freuen, die Situation zu verbessern. Bitte zögern Sie nicht, uns direkt zu kontaktieren.",
    },
    pt: {
      positive: "Muito obrigado pela sua maravilhosa avaliação! Ficamos felizes em saber que teve uma ótima experiência conosco. O seu feedback é muito valioso para a nossa equipe. Esperamos vê-lo novamente em breve!",
      negative: "Obrigado por partilhar a sua experiência connosco. Lamentamos muito que a sua visita não tenha correspondido às suas expectativas. Levamos cada feedback muito a sério e gostaríamos de poder melhorar a situação. Não hesite em contactar-nos diretamente.",
    },
    en: {
      positive: "Thank you so much for your wonderful review! We're thrilled to hear you had a great experience with us. Your feedback means the world to our team and motivates us to keep delivering excellent service. We look forward to welcoming you back soon!",
      negative: "Thank you for taking the time to share your experience with us. We're truly sorry to hear that your visit didn't meet your expectations. We take all feedback seriously and would love the opportunity to make things right. Please don't hesitate to reach out to us directly.",
    },
  };

  return replies[lang][isNegative ? "negative" : "positive"];
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
