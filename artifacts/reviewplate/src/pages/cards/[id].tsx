import { AuthLayout } from "@/components/layout/AuthLayout";
import {
  useGetCard, useUpdateCard, useActivateCard, useDeactivateCard,
  useListBusinessProfiles,
  getGetCardQueryKey, getListCardsQueryKey,
} from "@workspace/api-client-react";
import { ArrowLeft, Power, PowerOff, ExternalLink, Save, BarChart2, Building2, Plus, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
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

interface BusinessProfile {
  id: number;
  name: string;
  address: string | null;
  website: string | null;
  googleReviewUrl: string | null;
  logoUrl: string | null;
}

function ProfileLogo({ profile, size = "sm" }: { profile: BusinessProfile; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-6 h-6" : "w-10 h-10";
  const textSize = size === "sm" ? "text-[10px]" : "text-sm";
  if (profile.logoUrl) {
    return (
      <img
        src={profile.logoUrl}
        alt={profile.name}
        className={`${dim} rounded-md object-cover border border-border shrink-0`}
      />
    );
  }
  return (
    <span className={`${dim} bg-[#0D1117] rounded-md flex items-center justify-center text-primary font-bold ${textSize} shrink-0`}>
      {profile.name[0]?.toUpperCase()}
    </span>
  );
}

export default function CardEditorPage() {
  const params = useParams<{ id: string }>();
  const cardId = parseInt(params.id ?? "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: card, isLoading } = useGetCard(cardId, {
    query: { enabled: !!cardId, queryKey: getGetCardQueryKey(cardId) },
  });

  const { data: profiles } = useListBusinessProfiles();

  const updateMutation = useUpdateCard();
  const activateMutation = useActivateCard();
  const deactivateMutation = useDeactivateCard();

  const cardData = card as unknown as {
    id: number; code: string; nickname: string | null; status: string; platform: string | null;
    targetUrl: string | null; businessProfileId: number | null; scanCount: number;
    smartReviewEnabled: boolean; negativeAlertEnabled: boolean;
    createdAt: string; activatedAt: string | null;
  } | undefined;

  const profileList = (profiles as unknown as BusinessProfile[]) ?? [];

  const [nickname, setNickname] = useState("");
  const [businessProfileId, setBusinessProfileId] = useState<string>("");
  const [targetUrl, setTargetUrl] = useState("");
  const [smartReview, setSmartReview] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    if (cardData) {
      setNickname(cardData.nickname ?? "");
      setBusinessProfileId(cardData.businessProfileId != null ? String(cardData.businessProfileId) : "");
      setTargetUrl(cardData.targetUrl ?? "");
      setSmartReview(cardData.smartReviewEnabled);
    }
  }, [cardData]);

  const selectedProfile = profileList.find(p => String(p.id) === businessProfileId) ?? null;

  const handleSave = () => {
    updateMutation.mutate(
      {
        id: cardId,
        data: {
          nickname: nickname.trim() || null,
          businessProfileId: businessProfileId ? parseInt(businessProfileId) : null,
          targetUrl: targetUrl || null,
          smartReviewEnabled: smartReview,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCardQueryKey(cardId) });
          queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() });
          toast({ title: "Carte mise à jour", description: "Les paramètres ont été sauvegardés." });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour la carte." });
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
          toast({ title: "Carte activée", description: "La carte est maintenant active et prête à scanner." });
        },
        onError: (err: unknown) => {
          const body = (err as { response?: { data?: { code?: string } } })?.response?.data;
          if (body?.code === "ACTIVE_CARD_LIMIT_REACHED") {
            setShowUpgradeDialog(true);
          } else {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible d'activer la carte." });
          }
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
          toast({ title: "Carte désactivée" });
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
          <p className="text-[#6B7280]">Carte introuvable</p>
          <Link href="/cards"><Button className="mt-4" variant="outline">Retour aux cartes</Button></Link>
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
            <h1 className="text-2xl font-bold text-[#0D1117]">{cardData.nickname || `Carte ${cardData.code}`}</h1>
            {cardData.nickname && <p className="text-sm text-[#9CA3AF] font-mono mt-0.5">{cardData.code}</p>}
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
                Désactiver
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
                Activer
              </Button>
            )}
          </div>
        </div>

        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold text-[#0D1117]">Paramètres de la carte</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">

            {/* Nickname */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#374151]">Nom de la carte <span className="text-[#9CA3AF] font-normal">(optionnel)</span></Label>
              <Input
                placeholder="ex : Entrée principale, Comptoir, Table VIP…"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={80}
                data-testid="input-nickname"
              />
              <p className="text-xs text-[#6B7280]">Un nom personnalisé pour identifier facilement cette carte dans votre tableau de bord.</p>
            </div>

            {/* Business profile selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#374151]">Profil Business</Label>
              {profileList.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl border border-dashed border-border">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#374151]">Aucun profil business</p>
                    <p className="text-xs text-[#9CA3AF]">Créez un profil pour le rattacher à cette carte</p>
                  </div>
                  <Link href="/profiles">
                    <Button size="sm" variant="outline" className="shrink-0" data-testid="button-create-profile-link">
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Créer
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Select value={businessProfileId} onValueChange={setBusinessProfileId}>
                    <SelectTrigger className="h-11" data-testid="select-business-profile">
                      <SelectValue placeholder="Sélectionner un profil business" />
                    </SelectTrigger>
                    <SelectContent>
                      {profileList.map((profile) => (
                        <SelectItem key={profile.id} value={String(profile.id)}>
                          <div className="flex items-center gap-2">
                            <ProfileLogo profile={profile} size="sm" />
                            <span>{profile.name}</span>
                            {profile.address && (
                              <span className="text-[#9CA3AF] text-xs truncate max-w-[140px]">{profile.address}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Selected profile preview with logo */}
                  {selectedProfile && (
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <ProfileLogo profile={selectedProfile} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-900">{selectedProfile.name}</p>
                        {selectedProfile.address && (
                          <p className="text-xs text-amber-700 truncate">{selectedProfile.address}</p>
                        )}
                      </div>
                      <Link href={`/profiles/${selectedProfile.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-700 hover:bg-amber-100 shrink-0">
                          Modifier
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
              <p className="text-xs text-[#6B7280]">Associez cette carte à l'un de vos établissements.</p>
            </div>

            {/* Target URL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#374151]">URL de destination</Label>
              <div className="flex gap-2">
                <Input
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://g.page/votre-etablissement/review"
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
              <p className="text-xs text-[#6B7280]">L'URL vers laquelle les clients seront redirigés lorsqu'ils scannent la carte.</p>
            </div>

            {/* Smart Review */}
            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium text-[#374151]">Smart Review Flow</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Afficher un écran de notation avant de rediriger vers la plateforme d'avis</p>
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
                  Voir les Analytics
                </Button>
              </Link>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card info */}
        <Card className="bg-white border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#6B7280] font-medium mb-1">Code carte</p>
                <p className="font-mono font-bold text-[#0D1117]">{cardData.code}</p>
              </div>
              <div>
                <p className="text-[#6B7280] font-medium mb-1">Créée le</p>
                <p className="text-[#374151]">{new Date(cardData.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
              <div>
                <p className="text-[#6B7280] font-medium mb-1">Activée le</p>
                <p className="text-[#374151]">{cardData.activatedAt ? new Date(cardData.activatedAt).toLocaleDateString("fr-FR") : "Non activée"}</p>
              </div>
              <div>
                <p className="text-[#6B7280] font-medium mb-1">Scans totaux</p>
                <p className="font-bold text-[#0D1117]">{cardData.scanCount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog upgrade plan */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mx-auto mb-3">
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-[#0D1117]">
              Limite de cartes atteinte
            </DialogTitle>
            <DialogDescription className="text-center text-[#6B7280]">
              Le plan <span className="font-semibold text-[#374151]">Free</span> permet d'activer <span className="font-semibold text-[#374151]">1 carte</span> à la fois. Passez au plan supérieur pour en activer davantage.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-[#0D1117]">Premium</p>
                <p className="text-xs text-[#6B7280]">3 cartes actives simultanées</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#0D1117]">19 €</p>
                <p className="text-xs text-[#9CA3AF]">/mois</p>
              </div>
            </div>
            <ul className="space-y-1 text-xs text-[#374151]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                3 cartes actives
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                Générateur de réponses IA
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                Analytics avancés
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <Link href="/billing">
              <Button
                className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold"
                onClick={() => setShowUpgradeDialog(false)}
                data-testid="button-upgrade-premium"
              >
                <Zap className="w-4 h-4 mr-2" />
                Passer au Premium
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full text-[#6B7280]"
              onClick={() => setShowUpgradeDialog(false)}
            >
              Plus tard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
