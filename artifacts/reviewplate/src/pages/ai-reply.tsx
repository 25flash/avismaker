import { AuthLayout } from "@/components/layout/AuthLayout";
import { useGenerateAiReply } from "@workspace/api-client-react";
import { Bot, Sparkles, Copy, CheckCheck, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function AiReplyPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const generateMutation = useGenerateAiReply();
  const [review, setReview] = useState("");
  const [tone, setTone] = useState("professional");
  const [platform, setPlatform] = useState("google");
  const [reply, setReply] = useState("");
  const [copied, setCopied] = useState(false);

  const canUseAI = user?.plan === "premium" || user?.plan === "pro" || user?.plan === "business";

  const handleGenerate = () => {
    if (!review.trim()) return;
    generateMutation.mutate(
      { data: { originalReview: review, tone, platform } },
      {
        onSuccess: (result) => {
          const r = result as unknown as { reply: string };
          setReply(r.reply);
        },
        onError: (err: unknown) => {
          const apiError = err as { status?: number };
          if (apiError?.status === 403) {
            toast({ variant: "destructive", title: t("aiReply.upgradeRequired"), description: t("aiReply.upgradeDesc") });
          } else {
            toast({ variant: "destructive", title: t("aiReply.generateFailed"), description: t("aiReply.generateFailedDesc") });
          }
        },
      }
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: t("aiReply.copied"), description: t("aiReply.copiedDesc") });
  };

  return (
    <AuthLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1117] flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            {t("aiReply.title")}
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{t("aiReply.subtitle")}</p>
        </div>

        {!canUseAI && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900 mb-1">{t("aiReply.premiumFeature")}</p>
              <p className="text-sm text-purple-700 mb-3">
                {t("aiReply.premiumDesc")}
              </p>
              <Link href="/billing">
                <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700" data-testid="button-upgrade-ai">
                  {t("aiReply.upgradeNow")}
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <Card className={cn("bg-white border border-border shadow-sm", !canUseAI && "opacity-60 pointer-events-none")}>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-semibold text-[#0D1117]">{t("aiReply.customerReview")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-1.5">
                <Label>{t("aiReply.platformLabel")}</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger data-testid="select-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">{t("aiReply.platforms.google")}</SelectItem>
                    <SelectItem value="airbnb">{t("aiReply.platforms.airbnb")}</SelectItem>
                    <SelectItem value="tripadvisor">{t("aiReply.platforms.tripadvisor")}</SelectItem>
                    <SelectItem value="trustpilot">{t("aiReply.platforms.trustpilot")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{t("aiReply.toneLabel")}</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger data-testid="select-tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">{t("aiReply.tones.professional")}</SelectItem>
                    <SelectItem value="friendly">{t("aiReply.tones.friendly")}</SelectItem>
                    <SelectItem value="formal">{t("aiReply.tones.formal")}</SelectItem>
                    <SelectItem value="casual">{t("aiReply.tones.casual")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{t("aiReply.reviewText")}</Label>
                <Textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder={t("aiReply.reviewPlaceholder")}
                  rows={6}
                  data-testid="input-review-text"
                  className="resize-none"
                />
                <p className="text-xs text-right text-[#9CA3AF]">{t("aiReply.charsLeft", { count: review.length })}</p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!review.trim() || generateMutation.isPending}
                className="w-full bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
                data-testid="button-generate"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generateMutation.isPending ? t("aiReply.generating") : t("aiReply.generate")}
              </Button>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-[#0D1117]">{t("aiReply.generatedReply")}</CardTitle>
                {reply && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    data-testid="button-copy"
                    className="h-8 text-xs"
                  >
                    {copied ? <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                    {copied ? t("aiReply.copied") : t("aiReply.copy")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {generateMutation.isPending ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={cn("h-4 bg-[#F3F4F6] rounded animate-pulse", i === 4 ? "w-2/3" : "w-full")} />
                  ))}
                </div>
              ) : reply ? (
                <div className="space-y-3">
                  <div
                    className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap p-4 bg-[#F8FAFC] rounded-xl border border-border"
                    data-testid="text-generated-reply"
                  >
                    {reply}
                  </div>
                  <p className="text-xs text-[#9CA3AF]">{t("aiReply.aiDisclaimer")}</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
                  <p className="text-sm text-[#6B7280]">{t("aiReply.emptyState")}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{t("aiReply.emptyStateDesc")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="bg-[#F8FAFC] border border-border">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-[#374151] mb-3">{t("aiReply.tipsTitle")}</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm text-[#6B7280]">
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">01.</span>
                {t("aiReply.tip1")}
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">02.</span>
                {t("aiReply.tip2")}
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">03.</span>
                {t("aiReply.tip3")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
