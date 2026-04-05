import { AuthLayout } from "@/components/layout/AuthLayout";
import { useActivateCardByCode, getListCardsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, CreditCard, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function ActivatePage() {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [activated, setActivated] = useState<{ id: number; code: string } | null>(null);
  const activateMutation = useActivateCardByCode();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleActivate = () => {
    if (!code.trim()) return;
    activateMutation.mutate(
      { data: { code: code.trim().toUpperCase() } },
      {
        onSuccess: (result) => {
          const r = result as unknown as { id: number; code: string };
          setActivated(r);
          queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() });
        },
        onError: (err: unknown) => {
          const apiError = err as { data?: { error?: string }; status?: number };
          if (apiError?.status === 404) {
            toast({ variant: "destructive", title: "Code not found", description: "This activation code doesn't exist. Check and try again." });
          } else if (apiError?.status === 409) {
            toast({ variant: "destructive", title: "Already activated", description: "This card is already registered to another account." });
          } else {
            toast({ variant: "destructive", title: "Activation failed", description: apiError?.data?.error ?? "Something went wrong." });
          }
        },
      }
    );
  };

  if (activated) {
    return (
      <AuthLayout>
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#10B981]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0D1117] mb-2">{t("activate.success")}</h1>
          <p className="text-[#6B7280] mb-2">
            {t("activate.successDesc")}
          </p>
          <p className="text-sm font-mono font-bold text-[#0D1117] mb-8">
            {activated.code}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href={`/cards/${activated.id}`}>
              <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90" data-testid="button-setup-card">
                {t("cards.editCard")}
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => { setActivated(null); setCode(""); }}
              data-testid="button-activate-another"
            >
              {t("activate.activate")}
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1117]">{t("activate.title")}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{t("activate.subtitle")}</p>
        </div>

        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold text-[#0D1117] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Enter Activation Code
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#374151]">Activation Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. GM-63XPKF"
                className="h-14 text-center text-2xl font-mono font-bold tracking-widest uppercase"
                maxLength={16}
                data-testid="input-activation-code"
                onKeyDown={(e) => e.key === "Enter" && handleActivate()}
              />
              <p className="text-xs text-[#6B7280] text-center">
                The code is printed on the back of your card or in your order confirmation email.
              </p>
            </div>

            <Button
              onClick={handleActivate}
              disabled={!code.trim() || activateMutation.isPending}
              className="w-full h-12 bg-primary text-[#0D1117] font-semibold hover:bg-primary/90 text-base"
              data-testid="button-activate"
            >
              <Zap className="w-5 h-5 mr-2" />
              {activateMutation.isPending ? t("activate.activating") : t("activate.activate")}
            </Button>
          </CardContent>
        </Card>

        <div className="bg-[#FFF8ED] border border-amber-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#92400E] mb-2">Where to find the code?</h3>
          <ul className="text-sm text-[#92400E] space-y-1.5">
            <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>On the back of your physical NFC or QR card</li>
            <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>In your order confirmation email</li>
            <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>In your AvisMaker order receipt</li>
          </ul>
        </div>
      </div>
    </AuthLayout>
  );
}
