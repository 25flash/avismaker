import { AuthLayout } from "@/components/layout/AuthLayout";
import { useListPlans, useGetCurrentSubscription } from "@workspace/api-client-react";
import { Check, Zap, Crown, Sparkles, Building2, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";

const planIcons: Record<string, React.ElementType> = {
  free: Zap,
  premium: Crown,
  pro: Sparkles,
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
  pro: "bg-purple-600 text-white hover:bg-purple-700",
  business: "bg-[#0D1117] text-primary hover:bg-[#0D1117]/90",
};

const planIconBg: Record<string, string> = {
  free: "bg-gray-100",
  premium: "bg-amber-100",
  pro: "bg-purple-100",
  business: "bg-[#0D1117]",
};

const planIconColor: Record<string, string> = {
  free: "text-gray-500",
  premium: "text-amber-600",
  pro: "text-purple-600",
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

export default function BillingPage() {
  const { data: plans, isLoading: plansLoading } = useListPlans();
  const { data: subscription } = useGetCurrentSubscription();

  const { user } = useAuth();
  const { toast } = useToast();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const planList = (plans as unknown as Plan[]) ?? [];

  const currentSubscription = subscription as unknown as {
    plan: string; status: string; billingPeriod: string; renewsAt: string | null; monthlyPrice: number;
  } | null;

  const currentPlan = user?.plan ?? "free";
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const getPrice = (basePrice: number) => {
    if (basePrice === 0) return 0;
    return billing === "annual" ? Number((basePrice * 0.75).toFixed(2)) : basePrice;
  };

  const getAnnualTotal = (basePrice: number) => {
    return Number((basePrice * 0.75 * 12).toFixed(0));
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan || upgrading) return;
    const token = localStorage.getItem("reviewplate_token");
    if (!token) return;
    setUpgrading(planId);
    try {
      const res = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planId, billing }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Plan mis à jour !", description: `Vous êtes maintenant sur le plan ${planId} (${billing === "annual" ? "annuel" : "mensuel"}).` });
      window.location.reload();
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de changer de plan. Réessayez." });
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1117]">Facturation & Plans</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Choisissez le plan adapté à votre activité</p>
        </div>

        {/* Current plan banner */}
        <div className="bg-[#FFF8ED] border border-amber-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#92400E]">
              Plan actuel : <span className="capitalize">{currentPlan}</span>
              {currentSubscription?.billingPeriod === "annual" && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Annuel</span>
              )}
            </p>
            {currentSubscription?.renewsAt && (
              <p className="text-xs text-[#92400E]/70 mt-0.5">
                Renouvellement le {new Date(currentSubscription.renewsAt).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center bg-[#F3F4F6] rounded-xl p-1 gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                billing === "monthly"
                  ? "bg-white text-[#0D1117] shadow-sm"
                  : "text-[#6B7280] hover:text-[#374151]"
              )}
              data-testid="toggle-monthly"
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                billing === "annual"
                  ? "bg-white text-[#0D1117] shadow-sm"
                  : "text-[#6B7280] hover:text-[#374151]"
              )}
              data-testid="toggle-annual"
            >
              Annuel
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                -25%
              </span>
            </button>
          </div>
        </div>

        {billing === "annual" && (
          <p className="text-center text-sm text-green-700 font-medium -mt-4">
            Économisez 3 mois en passant à la facturation annuelle
          </p>
        )}

        {/* Plans grid */}
        <div className="grid gap-5 sm:grid-cols-3">
          {plansLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-96 bg-white border border-border rounded-xl animate-pulse" />
            ))
          ) : planList.map((plan) => {
            const Icon = planIcons[plan.id] ?? Zap;
            const isCurrentPlan = plan.id === currentPlan;
            const isHighlight = plan.id === "business";
            const price = getPrice(plan.price);

            return (
              <Card
                key={plan.id}
                className={cn(
                  "bg-white relative overflow-hidden transition-all",
                  planColors[plan.id] ?? "border-border",
                  isHighlight && "shadow-lg"
                )}
                data-testid={`card-plan-${plan.id}`}
              >
                {isHighlight && (
                  <div className="absolute top-0 left-0 right-0 bg-[#0D1117] text-primary text-xs font-semibold text-center py-1.5">
                    Le plus populaire
                  </div>
                )}
                <CardContent className={cn("p-6", isHighlight && "pt-10")}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                    planIconBg[plan.id] ?? "bg-gray-100"
                  )}>
                    <Icon className={cn("w-5 h-5", planIconColor[plan.id] ?? "text-gray-500")} />
                  </div>

                  <h3 className="text-lg font-bold text-[#0D1117] capitalize">{plan.name}</h3>

                  {/* Price */}
                  <div className="mt-2 mb-1">
                    {plan.price === 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-[#0D1117]">Gratuit</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-[#0D1117]">€{price}</span>
                          <span className="text-sm text-[#6B7280]">/mois</span>
                        </div>
                        {billing === "annual" && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[#9CA3AF] line-through">€{plan.price}/mois</span>
                            <span className="text-xs font-semibold text-green-600">
                              €{getAnnualTotal(plan.price)}/an
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Limits */}
                  <ul className="space-y-2 my-5">
                    {/* Active cards limit */}
                    <li className="flex items-center gap-2 text-sm text-[#374151]">
                      <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                      {plan.maxActiveCards === null
                        ? "Cartes actives illimitées"
                        : `${plan.maxActiveCards} carte active`}
                    </li>
                    {/* Business profiles limit */}
                    <li className="flex items-center gap-2 text-sm text-[#374151]">
                      <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                      {plan.maxProfiles === null
                        ? "Profils illimités"
                        : `${plan.maxProfiles} profil${plan.maxProfiles > 1 ? "s" : ""} business`}
                    </li>
                    {/* Other features */}
                    {(plan.features ?? []).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[#374151]">
                        <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrentPlan || !!upgrading}
                    className={cn("w-full font-semibold", planBtnColor[plan.id] ?? "")}
                    variant={isCurrentPlan ? "outline" : "default"}
                    data-testid={`button-plan-${plan.id}`}
                  >
                    {upgrading === plan.id
                      ? "En cours..."
                      : isCurrentPlan
                      ? "Plan actuel"
                      : plan.id === "free"
                      ? "Rétrograder"
                      : billing === "annual"
                      ? "Passer annuel"
                      : "Mettre à niveau"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-center text-[#9CA3AF]">
          Tous les prix en EUR. Facturation {billing === "annual" ? "annuelle" : "mensuelle"}. Annulable à tout moment.{" "}
          <a href="/support" className="text-primary hover:underline">Contactez-nous</a> pour un plan sur mesure.
        </p>
      </div>
    </AuthLayout>
  );
}
