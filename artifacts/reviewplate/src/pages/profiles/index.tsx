import { AuthLayout } from "@/components/layout/AuthLayout";
import { useListBusinessProfiles, useCreateBusinessProfile, getListBusinessProfilesQueryKey } from "@workspace/api-client-react";
import { Building2, Plus, Globe, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

interface ProfileForm {
  name: string;
  address: string;
  website: string;
  googleReviewUrl: string;
  description: string;
}

function ProfileAvatar({ name, logoUrl, size = "md" }: { name: string; logoUrl: string | null; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-9 h-9" : "w-12 h-12";
  const textSize = size === "sm" ? "text-sm" : "text-lg";
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${dim} rounded-xl object-cover border border-border shrink-0`}
      />
    );
  }
  return (
    <div className={`${dim} bg-[#0D1117] rounded-xl flex items-center justify-center shrink-0`}>
      <span className={`${textSize} font-bold text-primary`}>{name[0]?.toUpperCase()}</span>
    </div>
  );
}

export default function ProfilesPage() {
  const { data: profiles, isLoading } = useListBusinessProfiles();
  const createMutation = useCreateBusinessProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState<ProfileForm>({ name: "", address: "", website: "", googleReviewUrl: "", description: "" });

  const profileList = (profiles as unknown as Array<{
    id: number; name: string; address: string | null; website: string | null;
    googleReviewUrl: string | null; description: string | null; logoUrl: string | null;
    createdAt: string;
  }>) ?? [];

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createMutation.mutate(
      { data: { name: form.name, address: form.address || null, logoUrl: null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBusinessProfilesQueryKey() });
          setShowDialog(false);
          setForm({ name: "", address: "", website: "", googleReviewUrl: "", description: "" });
          toast({ title: "Profil créé", description: "Votre profil business a été sauvegardé." });
        },
        onError: (err: unknown) => {
          const apiError = err as { data?: { error?: string } };
          toast({ variant: "destructive", title: "Erreur", description: apiError?.data?.error ?? "Impossible de créer le profil." });
        },
      }
    );
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1117]">Profils Business</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Gérez vos établissements et leurs liens d'avis</p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
            data-testid="button-add-profile"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un profil
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : profileList.length === 0 ? (
          <Card className="bg-white border border-border">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-[#0D1117] mb-2">Aucun profil business</h3>
              <p className="text-sm text-[#6B7280] mb-6 max-w-xs mx-auto">
                Créez un profil pour chaque établissement afin d'organiser vos cartes d'avis.
              </p>
              <Button
                onClick={() => setShowDialog(true)}
                className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
                data-testid="button-create-first-profile"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer mon premier profil
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profileList.map((profile) => (
              <Link key={profile.id} href={`/profiles/${profile.id}`}>
                <Card
                  className="bg-white border border-border shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/30"
                  data-testid={`card-profile-${profile.id}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <ProfileAvatar name={profile.name} logoUrl={profile.logoUrl} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0D1117] truncate" data-testid={`text-profile-name-${profile.id}`}>{profile.name}</p>
                        {profile.address && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                            <p className="text-xs text-[#6B7280] truncate">{profile.address}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {profile.description && (
                      <p className="text-xs text-[#6B7280] line-clamp-2 mb-3">{profile.description}</p>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {profile.website && (
                        <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          <Globe className="w-3 h-3" /> Site web
                        </span>
                      )}
                      {profile.googleReviewUrl && (
                        <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                          <Star className="w-3 h-3" /> Google
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#9CA3AF] mt-3">
                      Créé le {new Date(profile.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create profile dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md" data-testid="dialog-create-profile">
          <DialogHeader>
            <DialogTitle className="text-[#0D1117]">Créer un profil business</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nom de l'établissement *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ex. Le Grand Hôtel"
                data-testid="input-profile-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Adresse</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="12 Rue de la Paix, Paris"
                data-testid="input-profile-address"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Site web</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://monrestaurant.fr"
                data-testid="input-profile-website"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Lien Google Avis</Label>
              <Input
                value={form.googleReviewUrl}
                onChange={(e) => setForm(f => ({ ...f, googleReviewUrl: e.target.value }))}
                placeholder="https://g.page/r/..."
                data-testid="input-profile-google-url"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Courte description de votre établissement…"
                rows={3}
                data-testid="input-profile-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} data-testid="button-cancel-profile">Annuler</Button>
            <Button
              onClick={handleCreate}
              disabled={!form.name.trim() || createMutation.isPending}
              className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
              data-testid="button-save-profile"
            >
              {createMutation.isPending ? "Création…" : "Créer le profil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
