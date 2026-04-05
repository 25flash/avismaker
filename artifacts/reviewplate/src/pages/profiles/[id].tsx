import { AuthLayout } from "@/components/layout/AuthLayout";
import {
  useGetBusinessProfile, useUpdateBusinessProfile, useDeleteBusinessProfile,
  useUpdateCard, useListCards,
  getListBusinessProfilesQueryKey, getGetBusinessProfileQueryKey, getListCardsQueryKey,
} from "@workspace/api-client-react";
import { ArrowLeft, Save, Trash2, Globe, MapPin, Star, CreditCard, Activity, ExternalLink, Plus, Upload, X, Unlink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
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
  nickname?: string | null;
  status: string;
  platform: string | null;
  targetUrl: string | null;
  scanCount: number;
  smartReviewEnabled: boolean;
  activatedAt: string | null;
}

export default function ProfileEditorPage() {
  const { t, i18n } = useTranslation();
  const params = useParams<{ id: string }>();
  const profileId = parseInt(params.id ?? "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useGetBusinessProfile(profileId, {
    query: { enabled: !!profileId, queryKey: getGetBusinessProfileQueryKey(profileId) },
  });

  const { data: cards, isLoading: cardsLoading } = useListCards(
    { businessProfileId: profileId },
    { query: { enabled: !!profileId } }
  );

  const updateMutation = useUpdateBusinessProfile();
  const deleteMutation = useDeleteBusinessProfile();
  const detachCardMutation = useUpdateCard();

  const handleDetachCard = (cardId: number, cardCode: string) => {
    detachCardMutation.mutate(
      { id: cardId, data: { businessProfileId: null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetBusinessProfileQueryKey(profileId) });
          toast({ title: t('profiles.detachSuccess'), description: t('profiles.detachSuccessDesc', { code: cardCode }) });
        },
        onError: () => {
          toast({ variant: "destructive", title: t('common.error'), description: t('profiles.detachError') });
        },
      }
    );
  };

  const profileData = profile as unknown as {
    id: number; name: string; address: string | null; website: string | null;
    googleReviewUrl: string | null; description: string | null; logoUrl: string | null;
    cardCount: number; totalScans: number; createdAt: string;
  } | undefined;

  const cardList = (cards as unknown as CardItem[]) ?? [];

  const [form, setForm] = useState({
    name: "",
    address: "",
    website: "",
    googleReviewUrl: "",
    description: "",
    logoUrl: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoChanged, setLogoChanged] = useState(false);

  useEffect(() => {
    if (profileData) {
      setForm({
        name: profileData.name,
        address: profileData.address ?? "",
        website: profileData.website ?? "",
        googleReviewUrl: profileData.googleReviewUrl ?? "",
        description: profileData.description ?? "",
        logoUrl: profileData.logoUrl ?? "",
      });
      setLogoPreview(profileData.logoUrl ?? null);
      setLogoChanged(false);
    }
  }, [profileData]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: t('profiles.invalidFormat'), description: t('profiles.invalidFormat') });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: t('profiles.logoTooLarge'), description: t('profiles.logoTooLargeDesc') });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoPreview(dataUrl);
      setForm(f => ({ ...f, logoUrl: dataUrl }));
      setLogoChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setForm(f => ({ ...f, logoUrl: "" }));
    setLogoChanged(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    updateMutation.mutate(
      {
        id: profileId,
        data: {
          name: form.name,
          address: form.address || null,
          logoUrl: logoChanged ? (form.logoUrl || null) : undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBusinessProfileQueryKey(profileId) });
          queryClient.invalidateQueries({ queryKey: getListBusinessProfilesQueryKey() });
          setLogoChanged(false);
          toast({ title: t('profiles.profileUpdated'), description: t('profiles.profileUpdatedDesc') });
        },
        onError: () => {
          toast({ variant: "destructive", title: t('common.error'), description: t('common.error') });
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
          toast({ title: t('profiles.profileDeleted') });
        },
        onError: () => {
          toast({ variant: "destructive", title: t('common.error'), description: t('common.error') });
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
          <p className="text-[#6B7280]">{t('profiles.notFound')}</p>
          <Link href="/profiles"><Button className="mt-4" variant="outline">{t('profiles.backToProfiles')}</Button></Link>
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
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt={profileData.name}
                className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-[#0D1117] rounded-xl flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-primary">{profileData.name[0]?.toUpperCase()}</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-[#0D1117]">{profileData.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-[#6B7280] flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  {cardList.length} {t('profiles.cards')}
                </span>
                <span className="text-sm text-[#6B7280] flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  {profileData.totalScans} {t('profiles.scans')}
                </span>
              </div>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 shrink-0" data-testid="button-delete">
                <Trash2 className="w-4 h-4 mr-1.5" />
                {t('profiles.delete')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('profiles.deleteTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('profiles.deleteDesc', { name: profileData.name })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('profiles.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="button-confirm-delete"
                >
                  {t('profiles.confirmDelete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Linked Cards */}
        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#0D1117] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                {t('profiles.linkedCards')}
              </CardTitle>
              <Link href="/cards">
                <Button size="sm" variant="outline" className="text-xs h-8" data-testid="button-manage-cards">
                  <Plus className="w-3 h-3 mr-1" />
                  {t('profiles.manageCards')}
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
                <p className="text-sm font-medium text-[#374151]">{t('profiles.noLinkedCards')}</p>
                <p className="text-xs text-[#9CA3AF] mt-1 mb-4">
                  {t('profiles.noLinkedCardsDesc')}
                </p>
                <Link href="/cards">
                  <Button size="sm" variant="outline" data-testid="button-go-to-cards">
                    <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                    {t('profiles.goToCards')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {cardList.map((card) => (
                  <div key={card.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors" data-testid={`card-row-${card.id}`}>
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt={profileData.name}
                        className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#0D1117] rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-xs font-mono font-bold text-primary">{card.code.slice(0, 2)}</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {card.nickname && (
                          <span className="font-semibold text-sm text-[#0D1117]">{card.nickname}</span>
                        )}
                        <span className={cn("font-mono text-sm", card.nickname ? "text-[#9CA3AF] text-xs" : "font-bold text-[#0D1117]")}>{card.code}</span>
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", statusClass[card.status] ?? "status-pill-inactive")}>
                          {t(`status.${card.status}`, card.status)}
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
                          {card.scanCount} {t('cards.scans')}
                        </span>
                        {card.activatedAt && (
                          <span className="text-xs text-[#9CA3AF]">
                            {t('cards.activatedOn')} {new Date(card.activatedAt).toLocaleDateString(i18n.language)}
                          </span>
                        )}
                      </div>
                    </div>

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
                          {t('profiles.configure')}
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50"
                            data-testid={`button-detach-card-${card.id}`}
                            title={t('profiles.detachCard')}
                          >
                            <Unlink className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('profiles.detachCard')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('profiles.detachCardDesc', { code: card.code })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('profiles.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDetachCard(card.id, card.code)}
                              className="bg-red-600 hover:bg-red-700"
                              data-testid={`button-confirm-detach-${card.id}`}
                            >
                              {t('profiles.confirmDetach')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
            <CardTitle className="text-base font-semibold text-[#0D1117]">{t('profiles.profileDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">

            {/* Logo upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                {t('profiles.logo')}
              </Label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative shrink-0">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-20 h-20 rounded-xl object-cover border border-border shadow-sm"
                    />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow transition-colors"
                      data-testid="button-remove-logo"
                      title={t('profiles.deleteLogo')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-[#F8FAFC] shrink-0">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-[#0D1117] rounded-lg flex items-center justify-center mx-auto mb-1">
                        <span className="text-sm font-bold text-primary">{profileData.name[0]?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                    onChange={handleLogoFileChange}
                    data-testid="input-logo-file"
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer w-full"
                      asChild
                      data-testid="button-upload-logo"
                    >
                      <span>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {logoPreview ? t('profiles.changeLogo') : t('profiles.uploadLogo')}
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-[#9CA3AF] mt-1.5">{t('profiles.logoHint')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t('profiles.nameRequired')}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="h-11"
                data-testid="input-name"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {t('profiles.address')}</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder={t('profiles.addressPlaceholder')}
                className="h-11"
                data-testid="input-address"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {t('profiles.website')}</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder={t('profiles.websitePlaceholder')}
                className="h-11"
                data-testid="input-website"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> {t('profiles.googleReviewUrl')}</Label>
              <Input
                value={form.googleReviewUrl}
                onChange={(e) => setForm(f => ({ ...f, googleReviewUrl: e.target.value }))}
                placeholder={t('profiles.googleUrlPlaceholder')}
                className="h-11"
                data-testid="input-google-url"
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t('profiles.description')}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder={t('profiles.descriptionPlaceholder')}
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
                {updateMutation.isPending ? t('profiles.saving') : t('profiles.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
