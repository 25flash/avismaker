import { AuthLayout } from "@/components/layout/AuthLayout";
import { useListPlans, useGetCurrentSubscription, useUpgradePlan } from "@workspace/api-client-react";
import { Check, Zap, Crown, Sparkles, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const planIcons: Record<string, React.ElementType> = {
  free: Zap,
  premium: Crown,
  pro: Sparkles,
  business: Building2,
};

const planHighlight: Record<string, boolean> = {
  free: false,
  premium: false,
  pro: true,
  business: false,
};

const planColors: Record<string, string> = {
  free: "border-border",
  premium: "border-amber-300",
  pro: "border-purple-400 ring-2 ring-purple-200",
  business: "border-[#0D1117]",
};

const planBtnColor: Record<string, string> = {
  free: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  premium: "bg-primary text-[#0D1117] hover:bg-primary/90",
  pro: "bg-purple-600 text-white hover:bg-purple-700",
  business: "bg-[#0D1117] text-primary hover:bg-[#0D1117]/90",
};

export default function BillingPage() {
  const { data: plans, isLoading: plansLoading } = useListPlans();
  const { data: subscription, isLoading: subLoading } = useGetCurrentSubscription();
  const updateMutation = useUpgradePlan();
  const { user } = useAuth();
  const { toast } = useToast();

  const planList = (plans as unknown as Array<{
    id: string; name: string; price: number;
    features: string[]; maxProfiles: number | null; aiReply: boolean;
  }>) ?? [];

  const currentSubscription = subscription as unknown as {
    plan: string; status: string; renewsAt: string | null;
  } | null;

  const currentPlan = user?.plan ?? "free";

  const handleUpgrade = (planId: string) => {
    if (planId === currentPlan) return;
    updateMutation.mutate(
      { data: { plan: planId } },
      {
        onSuccess: () => {
          toast({ title: "Plan updated!", description: `You are now on the ${planId} plan.` });
          window.location.reload();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to update plan. Please try again." });
        },
      }
    );
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1117]">Billing & Plans</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Choose the plan that fits your business</p>
        </div>

        {/* Current plan banner */}
        <div className="bg-[#FFF8ED] border border-amber-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#92400E]">
              Current plan: <span className="capitalize">{currentPlan}</span>
            </p>
            {currentSubscription?.renewsAt && (
              <p className="text-xs text-[#92400E]/70 mt-0.5">
                Renews {new Date(currentSubscription.renewsAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plansLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-96 bg-white border border-border rounded-xl animate-pulse" />
            ))
          ) : planList.map((plan) => {
            const Icon = planIcons[plan.id] ?? Zap;
            const isCurrentPlan = plan.id === currentPlan;
            const isHighlight = planHighlight[plan.id];

            return (
              <Card
                key={plan.id}
                className={cn("bg-white relative overflow-hidden transition-all", planColors[plan.id] ?? "border-border")}
                data-testid={`card-plan-${plan.id}`}
              >
                {isHighlight && (
                  <div className="absolute top-0 left-0 right-0 bg-purple-600 text-white text-xs font-semibold text-center py-1.5">
                    Most Popular
                  </div>
                )}
                <CardContent className={cn("p-6", isHighlight && "pt-10")}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                    plan.id === "free" ? "bg-gray-100" :
                    plan.id === "premium" ? "bg-amber-100" :
                    plan.id === "pro" ? "bg-purple-100" :
                    "bg-[#0D1117]"
                  )}>
                    <Icon className={cn("w-5 h-5",
                      plan.id === "free" ? "text-gray-500" :
                      plan.id === "premium" ? "text-amber-600" :
                      plan.id === "pro" ? "text-purple-600" :
                      "text-primary"
                    )} />
                  </div>

                  <h3 className="text-lg font-bold text-[#0D1117] capitalize">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2 mb-5">
                    <span className="text-3xl font-bold text-[#0D1117]">
                      {plan.price === 0 ? "Free" : `£${plan.price}`}
                    </span>
                    {plan.price > 0 && <span className="text-sm text-[#6B7280]">/mo</span>}
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    <li className="flex items-center gap-2 text-sm text-[#374151]">
                      <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                      {plan.maxProfiles === null ? "Unlimited profiles" : `${plan.maxProfiles} business profile${plan.maxProfiles > 1 ? "s" : ""}`}
                    </li>
                    {plan.aiReply && (
                      <li className="flex items-center gap-2 text-sm text-[#374151]">
                        <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                        AI reply generator
                      </li>
                    )}
                    {(plan.features ?? []).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[#374151]">
                        <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrentPlan || updateMutation.isPending}
                    className={cn("w-full font-semibold", planBtnColor[plan.id] ?? "")}
                    variant={isCurrentPlan ? "outline" : "default"}
                    data-testid={`button-plan-${plan.id}`}
                  >
                    {isCurrentPlan ? "Current plan" : plan.id === "free" ? "Downgrade" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-center text-[#9CA3AF]">
          All prices shown in GBP and billed monthly. Cancel anytime. Need a custom plan?{" "}
          <a href="/support" className="text-primary hover:underline">Contact us</a>.
        </p>
      </div>
    </AuthLayout>
  );
}
