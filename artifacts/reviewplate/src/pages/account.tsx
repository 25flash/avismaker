import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Camera, User, Trash2, Save, Loader2, Check, Zap, Crown, Building2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useListPlans, useGetCurrentSubscription } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const planIcons: Record<string, React.ElementType> = {
  free: Zap,
  premium: Crown,
  business: Building2,
};
const planColors: Record<string, string> = {
  free: "border-border",
  premium: "border-amber-300",
  business: "border-[#0D1117] ring-2 ring-[#0D1117]/10",
};
const planBtnColor: Record<string, string> = {
  free: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  premium: "bg-primary text-[#0D1117] hover:bg-primary/90",
  business: "bg-[#0D1117] text-primary hover:bg-[#0D1117]/90",
};
const planIconBg: Record<string, string> = {
  free: "bg-gray-100",
  premium: "bg-amber-100",
  business: "bg-[#0D1117]",
};
const planIconColor: Record<string, string> = {
  free: "text-gray-500",
  premium: "text-amber-600",
  business: "text-primary",
};

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxProfiles: number | null;
  maxActiveCards: number | null;
  aiReply: boolean;
}

export default function AccountPage() {
  const { t } = useTranslation();
  const { user, token, setAuth } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Profile section
  const [name, setName] = useState(user?.name ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarData, setAvatarData] = useState<string | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Plan section
  const { data: plans, isLoading: plansLoading } = useListPlans();
  const { data: subscription } = useGetCurrentSubscription();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const planList = (plans as unknown as Plan[]) ?? [];
  const currentSubscription = subscription as unknown as {
    plan: string; status: string; billingPeriod: string; renewsAt: string | null; monthlyPrice: number;
  } | null;
  const currentPlan = user?.plan ?? "free";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t("account.avatarTooBig"), description: t("account.avatarTooBigDesc"), variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarPreview(result);
      setAvatarData(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const body: Record<string, string | null> = { name };
      if (avatarData !== undefined) body.avatarUrl = avatarData;
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setAuth(updated, token);
      setAvatarData(undefined);
      toast({ title: t("account.saved"), description: t("account.savedDesc") });
    } catch {
      toast({ title: t("account.saveFailed"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan || upgrading) return;
    if (!token) return;
    setUpgrading(planId);
    try {
      const res = await fetch(`${API_BASE}/api/subscriptions/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planId, billing }),
      });
      if (!res.ok) throw new Error();
      // Refresh user + subscription data without full reload
      await queryClient.invalidateQueries();
      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        const updatedUser = await meRes.json();
        setAuth(updatedUser, token);
      }
      toast({
        title: t("account.planUpdated"),
        description: t("account.planUpdatedDesc", { plan: planId }),
      });
    } catch {
      toast({ variant: "destructive", title: t("billing.updateFailed"), description: t("billing.updateFailedDesc") });
    } finally {
      setUpgrading(null);
    }
  };

  const getPrice = (basePrice: number) =>
    billing === "annual" && basePrice > 0 ? Number((basePrice * 0.75).toFixed(2)) : basePrice;

  const isDirty = name !== user?.name || avatarData !== undefined;

  return (
    <AuthLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#0D1117]">{t("account.title")}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{t("account.subtitle")}</p>
        </div>

        {/* ── Profile card ── */}
        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold text-[#0D1117]">{t("account.identity")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-6">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <div className={cn(
                  "w-24 h-24 rounded-2xl overflow-hidden border-2 border-border shadow-sm",
                  !avatarPreview && "bg-primary/10 flex items-center justify-center"
                )}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-primary/50" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-primary/90 transition-colors"
                  title={t("account.changeAvatar")}
                >
                  <Camera className="w-3.5 h-3.5 text-[#0D1117]" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-[#374151]">{t("account.avatarLabel")}</p>
                <p className="text-xs text-[#6B7280]">{t("account.avatarHint")}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs">
                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                    {t("account.uploadLogo")}
                  </Button>
                  {avatarPreview && (
                    <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar} className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      {t("account.removeLogo")}
                    </Button>
                  )}
                </div>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="account-name" className="text-sm font-medium text-[#374151]">{t("account.nameLabel")}</Label>
              <Input id="account-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("account.namePlaceholder")} className="max-w-sm" />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#374151]">{t("account.emailLabel")}</Label>
              <Input value={user?.email ?? ""} disabled className="max-w-sm bg-[#F9FAFB] text-[#9CA3AF]" />
              <p className="text-xs text-[#9CA3AF]">{t("account.emailReadOnly")}</p>
            </div>

            {/* Save button */}
            <div className="pt-1">
              <Button
                onClick={handleSave}
                disabled={!isDirty || saving || !name.trim()}
                className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90 disabled:opacity-50"
                data-testid="button-save-account"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("account.saving")}</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />{t("account.save")}</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Plan & Subscription card ── */}
        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold text-[#0D1117] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              {t("account.planTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">

            {/* Current plan banner */}
            <div className="bg-[#FFF8ED] border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#92400E] capitalize">
                  {t("billing.currentPlan", { plan: currentPlan })}
                  {currentSubscription?.billingPeriod === "annual" && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{t("billing.annualLabel")}</span>
                  )}
                </p>
                {currentSubscription?.renewsAt && (
                  <p className="text-xs text-[#92400E]/70 mt-0.5">
                    {t("billing.renewsOn", { date: new Date(currentSubscription.renewsAt).toLocaleDateString() })}
                  </p>
                )}
              </div>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6B7280]">{t("account.billingCycle")}</span>
              <div className="inline-flex items-center bg-[#F3F4F6] rounded-xl p-1 gap-1">
                <button
                  onClick={() => setBilling("monthly")}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    billing === "monthly" ? "bg-white text-[#0D1117] shadow-sm" : "text-[#6B7280] hover:text-[#374151]"
                  )}
                >
                  {t("billing.monthly")}
                </button>
                <button
                  onClick={() => setBilling("annual")}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                    billing === "annual" ? "bg-white text-[#0D1117] shadow-sm" : "text-[#6B7280] hover:text-[#374151]"
                  )}
                >
                  {t("billing.annual")}
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                    {t("billing.annualDiscount")}
                  </span>
                </button>
              </div>
            </div>

            {/* Plan cards grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              {plansLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-52 bg-[#F9FAFB] border border-border rounded-xl animate-pulse" />
                ))
              ) : planList.map((plan) => {
                const Icon = planIcons[plan.id] ?? Zap;
                const isCurrentPlan = plan.id === currentPlan;
                const isHighlight = plan.id === "business";
                const price = getPrice(plan.price);

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative rounded-xl border p-4 flex flex-col gap-3 transition-all",
                      planColors[plan.id] ?? "border-border",
                      isCurrentPlan && "bg-[#FAFAFA]",
                      isHighlight && "shadow-md"
                    )}
                  >
                    {isHighlight && (
                      <div className="absolute -top-px left-0 right-0 bg-[#0D1117] text-primary text-[10px] font-bold text-center py-1 rounded-t-xl">
                        {t("billing.mostPopular")}
                      </div>
                    )}

                    <div className={cn("mt-1 w-8 h-8 rounded-lg flex items-center justify-center", isHighlight && "mt-4", planIconBg[plan.id] ?? "bg-gray-100")}>
                      <Icon className={cn("w-4 h-4", planIconColor[plan.id] ?? "text-gray-500")} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#0D1117] capitalize">{plan.name}</p>
                      {plan.price === 0 ? (
                        <p className="text-xl font-bold text-[#0D1117]">{t("billing.freePrice")}</p>
                      ) : (
                        <p className="text-xl font-bold text-[#0D1117]">
                          €{price}<span className="text-xs font-normal text-[#6B7280]">{t("billing.perMonth")}</span>
                        </p>
                      )}
                    </div>

                    {/* Key features */}
                    <ul className="space-y-1 flex-1">
                      <li className="flex items-start gap-1.5 text-xs text-[#374151]">
                        <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        {plan.maxActiveCards === null
                          ? t("billing.unlimitedCards", "Unlimited active cards")
                          : t("billing.activeCardsCount", "{{count}} active card(s)", { count: plan.maxActiveCards })}
                      </li>
                      <li className="flex items-start gap-1.5 text-xs text-[#374151]">
                        <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        {plan.maxProfiles === null
                          ? t("billing.unlimitedProfiles", "Unlimited profiles")
                          : t("billing.profilesCount", "{{count}} business profile(s)", { count: plan.maxProfiles })}
                      </li>
                      {plan.aiReply && (
                        <li className="flex items-start gap-1.5 text-xs text-[#374151]">
                          <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                          {t("billing.features.aiReplies", "AI Replies")}
                        </li>
                      )}
                    </ul>

                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrentPlan || !!upgrading}
                      size="sm"
                      className={cn("w-full text-xs font-semibold", isCurrentPlan ? "bg-transparent border border-border text-[#6B7280]" : (planBtnColor[plan.id] ?? ""))}
                      variant={isCurrentPlan ? "outline" : "default"}
                      data-testid={`button-plan-${plan.id}`}
                    >
                      {upgrading === plan.id ? (
                        <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{t("billing.upgrading")}</>
                      ) : isCurrentPlan ? (
                        t("billing.currentPlanBtn")
                      ) : plan.id === "free" ? (
                        t("billing.downgrade")
                      ) : (
                        t("billing.upgrade")
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-[#9CA3AF]">
              {t("billing.footer", "All prices in EUR. Cancel anytime.")}{" "}
              <a href="/billing" className="text-primary hover:underline">{t("account.viewFullBilling")}</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
