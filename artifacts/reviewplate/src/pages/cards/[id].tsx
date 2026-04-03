import { AuthLayout } from "@/components/layout/AuthLayout";
import { useGetCard, useUpdateCard, useActivateCard, useDeactivateCard, getGetCardQueryKey, getListCardsQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Power, PowerOff, ExternalLink, Save, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const statusClass: Record<string, string> = {
  active: "status-pill-active",
  inactive: "status-pill-inactive",
  disabled: "status-pill-disabled",
};

export default function CardEditorPage() {
  const params = useParams<{ id: string }>();
  const cardId = parseInt(params.id ?? "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: card, isLoading } = useGetCard(cardId, {
    query: { enabled: !!cardId, queryKey: getGetCardQueryKey(cardId) },
  });

  const updateMutation = useUpdateCard();
  const activateMutation = useActivateCard();
  const deactivateMutation = useDeactivateCard();

  const cardData = card as unknown as {
    id: number; code: string; status: string; platform: string | null;
    targetUrl: string | null; businessProfileId: number | null; scanCount: number;
    smartReviewEnabled: boolean; negativeAlertEnabled: boolean;
    createdAt: string; activatedAt: string | null;
  } | undefined;

  const [platform, setPlatform] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [smartReview, setSmartReview] = useState(false);

  useEffect(() => {
    if (cardData) {
      setPlatform(cardData.platform ?? "");
      setTargetUrl(cardData.targetUrl ?? "");
      setSmartReview(cardData.smartReviewEnabled);
    }
  }, [cardData]);

  const handleSave = () => {
    updateMutation.mutate(
      { id: cardId, data: { platform: platform || null, targetUrl: targetUrl || null, smartReviewEnabled: smartReview } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCardQueryKey(cardId) });
          queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() });
          toast({ title: "Card updated", description: "Your card settings have been saved." });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to update card." });
        },
      }
    );
  };

  const handleActivate = () => {
    activateMutation.mutate(
      { id: cardId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCardQueryKey(cardId) });
          toast({ title: "Card activated", description: "Card is now active and ready to scan." });
        },
      }
    );
  };

  const handleDeactivate = () => {
    deactivateMutation.mutate(
      { id: cardId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCardQueryKey(cardId) });
          toast({ title: "Card deactivated" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AuthLayout>
    );
  }

  if (!cardData) {
    return (
      <AuthLayout>
        <div className="text-center py-16">
          <p className="text-[#6B7280]">Card not found</p>
          <Link href="/cards"><Button className="mt-4" variant="outline">Back to cards</Button></Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Link href="/cards">
            <button className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#0D1117]">Card {cardData.code}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", statusClass[cardData.status] ?? "status-pill-inactive")}>
                {cardData.status}
              </span>
              <span className="text-xs text-[#6B7280]">{cardData.scanCount} scans total</span>
            </div>
          </div>
          <div className="flex gap-2">
            {cardData.status === "active" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeactivate}
                disabled={deactivateMutation.isPending}
                data-testid="button-deactivate"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <PowerOff className="w-4 h-4 mr-1.5" />
                Deactivate
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleActivate}
                disabled={activateMutation.isPending || cardData.status === "disabled"}
                data-testid="button-activate"
                className="bg-[#10B981] text-white hover:bg-[#10B981]/90"
              >
                <Power className="w-4 h-4 mr-1.5" />
                Activate
              </Button>
            )}
          </div>
        </div>

        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold text-[#0D1117]">Card Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#374151]">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="h-11" data-testid="select-platform">
                  <SelectValue placeholder="Select review platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                  <SelectItem value="trustpilot">Trustpilot</SelectItem>
                  <SelectItem value="multilink">Multi-link</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#374151]">Target URL</Label>
              <div className="flex gap-2">
                <Input
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://g.page/your-business/review"
                  className="h-11 font-mono text-sm"
                  data-testid="input-target-url"
                />
                {targetUrl && (
                  <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">The URL customers will be redirected to when they scan the card.</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium text-[#374151]">Smart Review Flow</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Show a rating screen before redirecting to the review platform</p>
              </div>
              <Switch
                checked={smartReview}
                onCheckedChange={setSmartReview}
                data-testid="switch-smart-review"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <Link href={`/analytics/cards/${cardData.id}`}>
                <Button variant="outline" size="sm" data-testid="button-analytics">
                  <BarChart2 className="w-4 h-4 mr-1.5" />
                  View Analytics
                </Button>
              </Link>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card info */}
        <Card className="bg-white border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#6B7280] font-medium mb-1">Card Code</p>
                <p className="font-mono font-bold text-[#0D1117]">{cardData.code}</p>
              </div>
              <div>
                <p className="text-[#6B7280] font-medium mb-1">Created</p>
                <p className="text-[#374151]">{new Date(cardData.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[#6B7280] font-medium mb-1">Activated</p>
                <p className="text-[#374151]">{cardData.activatedAt ? new Date(cardData.activatedAt).toLocaleDateString() : "Not activated"}</p>
              </div>
              <div>
                <p className="text-[#6B7280] font-medium mb-1">Total Scans</p>
                <p className="font-bold text-[#0D1117]">{cardData.scanCount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
