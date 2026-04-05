import { useGetPublicCard } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { AlertCircle, Loader2, ExternalLink, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

async function submitScanLog(code: string, body: { wasNegative: boolean; rating?: number; feedbackText?: string }) {
  try {
    await fetch(`/api/public/scan/${code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // ignore
  }
}

export default function ScanPage() {
  const { t } = useTranslation();
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";

  const { data: card, isLoading, isError } = useGetPublicCard(code, {
    query: { enabled: !!code },
  });

  const [step, setStep] = useState<"loading" | "rate" | "bad" | "redirect" | "error">("loading");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cardData = card as unknown as {
    id: number; code: string; targetUrl: string | null; platform: string | null;
    smartReviewEnabled: boolean; businessName: string | null;
  } | undefined;

  useEffect(() => {
    if (isError) { setStep("error"); return; }
    if (!isLoading && cardData) {
      if (!cardData.smartReviewEnabled) {
        setStep("redirect");
      } else {
        setStep("rate");
      }
    }
  }, [cardData, isLoading, isError]);

  useEffect(() => {
    if (step === "redirect" && cardData?.targetUrl) {
      submitScanLog(code, { wasNegative: false });
      const timer = setTimeout(() => {
        if (cardData.targetUrl) window.location.href = cardData.targetUrl;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleRating = async (r: number) => {
    setRating(r);
    if (r >= 4) {
      submitScanLog(code, { wasNegative: false, rating: r });
      if (cardData?.targetUrl) {
        setTimeout(() => { if (cardData?.targetUrl) window.location.href = cardData.targetUrl!; }, 800);
      }
    } else {
      setStep("bad");
    }
  };

  const handleFeedback = async () => {
    setSubmitting(true);
    await submitScanLog(code, { wasNegative: true, rating, feedbackText: feedback });
    setSubmitting(false);
    setStep("redirect");
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <img src="/logo.png" alt="AvisMaker" className="w-9 h-9 object-contain shrink-0" />
          <span className="text-base font-bold text-white">AvisMaker</span>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          {(step === "loading" || isLoading) && (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">{t("scan.loading")}</p>
            </div>
          )}

          {step === "error" && (
            <div className="p-8 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-[#0D1117] mb-2">{t("scan.notFound")}</h2>
              <p className="text-sm text-[#6B7280]">{t("scan.cardNotFoundDesc2")}</p>
            </div>
          )}

          {step === "redirect" && (
            <div className="p-8 text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-[#0D1117] mb-2">
                {cardData?.targetUrl ? t("scan.redirectingTitle") : t("scan.thankYouTitle")}
              </h2>
              <p className="text-sm text-[#6B7280]">
                {cardData?.targetUrl
                  ? t("scan.redirectingDesc", { name: cardData.businessName ?? "this business" })
                  : t("scan.thankYouDesc")}
              </p>
            </div>
          )}

          {step === "rate" && !isLoading && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[#0D1117] mb-1">
                  {cardData?.businessName
                    ? t("scan.howWas", { name: cardData.businessName })
                    : t("scan.howWasExperience")}
                </h2>
                <p className="text-sm text-[#6B7280]">{t("scan.tapToRate")}</p>
              </div>
              <div className="flex justify-center gap-3 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRating(star)}
                    data-testid={`star-${star}`}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className="w-10 h-10 transition-colors"
                      fill={(hoverRating || rating) >= star ? "#F59E0B" : "none"}
                      stroke={(hoverRating || rating) >= star ? "#F59E0B" : "#D1D5DB"}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-[#9CA3AF]">{t("scan.feedbackHelps")}</p>
            </div>
          )}

          {step === "bad" && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[#0D1117] mb-1">{t("scan.sorryTitle")}</h2>
                <p className="text-sm text-[#6B7280]">{t("scan.shareWhatWentWrong")}</p>
              </div>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t("scan.couldWeDoBetter")}
                rows={4}
                className="mb-4 resize-none"
                data-testid="input-feedback"
              />
              <Button
                onClick={handleFeedback}
                disabled={submitting}
                className="w-full bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
                data-testid="button-submit-feedback"
              >
                {submitting ? t("scan.sending") : t("scan.sendFeedback")}
              </Button>
              <button
                onClick={() => setStep("redirect")}
                className="w-full text-sm text-[#6B7280] hover:text-[#374151] mt-3 text-center"
                data-testid="button-skip-feedback"
              >
                {t("scan.skipForNow")}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          {t("scan.poweredBy")}
        </p>
      </div>
    </div>
  );
}
