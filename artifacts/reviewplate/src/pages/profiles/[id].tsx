import { AuthLayout } from "@/components/layout/AuthLayout";
import {
  useGetBusinessProfile, useUpdateBusinessProfile, useDeleteBusinessProfile,
  useListCards,
  getListBusinessProfilesQueryKey, getGetBusinessProfileQueryKey,
} from "@workspace/api-client-react";
import { ArrowLeft, Save, Trash2, Globe, MapPin, Star, CreditCard, Activity, ExternalLink, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusClass: Record<string, string> = {
  active: "status-pill-active",
  inactive: "status-pill-inactive",
  disabled: "status-pill-disabled",
};

const platformColors: Record<string, string> = {
  google: "bg-blue-100 text-blue-700",
  airbnb: "bg-red-100 text-red-700",
  tripadvisor: "bg-green-100 text-green-700",
  trustpilot: "bg-emerald-100 text-emerald-700",
  multilink: "bg-purple-100 text-purple-700",
  social: "bg-pink-100 text-pink-700",
};

interface CardItem {
  id: number;
  code: string;
  status: string;
  platform: string | null;
  targetUrl: string | null;
  scanCount: number;
  smartReviewEnabled: boolean;
  activatedAt: string | null;
}

export default function ProfileEditorPage() {
  const params = useParams<{ id: string }>();
  const profileId = parseInt(params.id ?? "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading } = useGetBusinessProfile(profileId, {
    query: { enabled: !!profileId, queryKey: getGetBusinessProfileQueryKey(profileId) },
  });

  const { data: cards, isLoading: cardsLoading } = useListCards(
    { businessProfileId: profileId },
    { query: { enabled: !!profileId } }
  );

  const updateMutation = useUpdateBusinessProfile();
  const deleteMutation = useDeleteBusinessProfile();

  const profileData = profile as unknown as {
    id: number; name: string; address: string | null; website: string | null;
    googleReviewUrl: string | null; description: string | null; logoUrl: string | null;
    cardCount: number; totalScans: number; createdAt: string;
  } | undefined;

  const cardList = (cards as unknown as CardItem[]) ?? [];

  const [form, setForm] = useState({ name: "", address: "", website: "", googleReviewUrl: "", description: "" });

  useEffect(() => {
    if (profileData) {
      setForm({
        name: profileData.name,
        address: profileData.address ?? "",
        website: profileData.website ?? "",
        googleReviewUrl: profileData.googleReviewUrl ?? "",
        description: profileData.description ?? "",
      });
    }
  }, [profileData]);

  const handleSave = () => {
    updateMutation.mutate(
      { id: profileId, data: { name: form.name, address: form.address || null, website: form.website || null, googleReviewUrl: form.googleReviewUrl || null, description: form.description || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBusinessProfileQueryKey(profileId) });
          queryClient.invalidateQueries({ queryKey: getListBusinessProfilesQueryKey() });
          toast({ title: "Profil mis à jour", description: "Les informations ont été sauvegardées." });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le profil." });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      { id: profileId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBusinessProfilesQueryKey() });
          setLocation("/profiles");
          toast({ title: "Profil supprimé" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer le profil." });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="space-y-6 max-w-2xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AuthLayout>
    );
  }

  if (!profileData) {
    return (
      <AuthLayout>
        <div className="text-center py-16">
          <p className="text-[#6B7280]">Profil introuvable</p>
          <Link href="/profiles"><Button className="mt-4" variant="outline">Retour aux profils</Button></Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6 max-w-2xl">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/profiles">
            <button className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#0D1117]">{profileData.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-[#6B7280] flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                {cardList.length} carte{cardList.length !== 1 ? "s" : ""} rattachée{cardList.length !== 1 ? "s" : ""}
              </span>
              <span className="text-sm text-[#6B7280] flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                {profileData.totalScans} scan{profileData.totalScans !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" data-testid="button-delete">
                <Trash2 className="w-4 h-4 mr-1.5" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce profil ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Le profil "{profileData.name}" sera définitivement supprimé. Les cartes rattachées ne seront pas supprimées mais perdront leur association. Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="button-confirm-delete"
                >
                  Supprimer le profil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Cartes rattachées */}
        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#0D1117] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Cartes rattachées
              </CardTitle>
              <Link href="/cards">
                <Button size="sm" variant="outline" className="text-xs h-8" data-testid="button-manage-cards">
                  <Plus className="w-3 h-3 mr-1" />
                  Gérer les cartes
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {cardsLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : cardList.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-12 h-12 bg-[#F3F4F6] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-[#9CA3AF]" />
                </div>
                <p className="text-sm font-medium text-[#374151]">Aucune carte rattachée</p>
                <p className="text-xs text-[#9CA3AF] mt-1 mb-4">
                  Rattachez une carte NFC/QR à ce profil depuis la page carte.
                </p>
                <Link href="/cards">
                  <Button size="sm" variant="outline" data-testid="button-go-to-cards">
                    <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                    Voir mes cartes
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {cardList.map((card) => (
                  <div key={card.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors" data-testid={`card-row-${card.id}`}>
                    {/* Code badge */}
                    <div className="w-10 h-10 bg-[#0D1117] rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-xs font-mono font-bold text-primary">{card.code.slice(0, 2)}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-[#0D1117]">{card.code}</span>
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", statusClass[card.status] ?? "status-pill-inactive")}>
                          {card.status === "active" ? "Active" : card.status === "inactive" ? "Inactive" : "Désactivée"}
                        </span>
                        {card.platform && (
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded", platformColors[card.platform] ?? "bg-gray-100 text-gray-700")}>
                            {card.platform}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-[#6B7280] flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {card.scanCount} scan{card.scanCount !== 1 ? "s" : ""}
                        </span>
                        {card.activatedAt && (
                          <span className="text-xs text-[#9CA3AF]">
                            Activée le {new Date(card.activatedAt).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {card.targetUrl && (
                        <a href={card.targetUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9CA3AF] hover:text-[#374151]">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                      <Link href={`/cards/${card.id}`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs" data-testid={`button-edit-card-${card.id}`}>
                          Configurer
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold text-[#0D1117]">Informations du profil</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-1.5">
              <Label>Nom de l'établissement *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="h-11"
                data-testid="input-name"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Adresse</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="12 Rue de la Paix, Paris"
                className="h-11"
                data-testid="input-address"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Site web</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://monrestaurant.fr"
                className="h-11"
                data-testid="input-website"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Lien Google Avis</Label>
              <Input
                value={form.googleReviewUrl}
                onChange={(e) => setForm(f => ({ ...f, googleReviewUrl: e.target.value }))}
                placeholder="https://g.page/r/..."
                className="h-11"
                data-testid="input-google-url"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Courte description de votre établissement..."
                data-testid="input-description"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                onClick={handleSave}
                disabled={!form.name.trim() || updateMutation.isPending}
                className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
