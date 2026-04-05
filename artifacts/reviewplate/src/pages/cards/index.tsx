import { AuthLayout } from "@/components/layout/AuthLayout";
import { useListCards, useListBusinessProfiles } from "@workspace/api-client-react";
import { CreditCard, Plus, Activity, Search, X, SlidersHorizontal, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth-context";
import { useState, useMemo } from "react";

const statusDot: Record<string, string> = {
  active: "bg-[#10B981]",
  inactive: "bg-[#F59E0B]",
  disabled: "bg-[#9CA3AF]",
};
const statusPill: Record<string, string> = {
  active: "bg-[#D1FAE5] text-[#065F46]",
  inactive: "bg-[#FEF3C7] text-[#92400E]",
  disabled: "bg-[#F3F4F6] text-[#6B7280]",
};

const platformColors: Record<string, string> = {
  google: "bg-blue-100 text-blue-700",
  airbnb: "bg-red-100 text-red-700",
  tripadvisor: "bg-green-100 text-green-700",
  trustpilot: "bg-emerald-100 text-emerald-700",
  multilink: "bg-purple-100 text-purple-700",
  social: "bg-pink-100 text-pink-700",
};

const PLATFORMS = ["google", "airbnb", "tripadvisor", "trustpilot", "multilink", "social"];
const STATUSES = ["active", "inactive", "disabled"];

interface BusinessProfile {
  id: number;
  name: string;
  logoUrl: string | null;
}

interface CardItem {
  id: number;
  code: string;
  nickname: string | null;
  status: string;
  platform: string | null;
  targetUrl: string | null;
  businessProfileId: number | null;
  scanCount: number;
  smartReviewEnabled: boolean;
  createdAt: string;
  activatedAt: string | null;
}

export default function CardsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: cards, isLoading } = useListCards();
  const { data: profiles } = useListBusinessProfiles();

  const isBusinessPlan = user?.plan === "business";

  const [search, setSearch] = useState("");
  const [profileFilter, setProfileFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const cardList = (cards as unknown as CardItem[]) ?? [];

  const profileList = (profiles as unknown as BusinessProfile[]) ?? [];
  const profileMap = profileList.reduce<Record<number, BusinessProfile>>(
    (acc, p) => { acc[p.id] = p; return acc; },
    {}
  );

  const hasActiveFilters = search.trim() !== "" || profileFilter !== "all" || platformFilter !== "all" || statusFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setProfileFilter("all");
    setPlatformFilter("all");
    setStatusFilter("all");
  };

  const filteredCards = useMemo(() => {
    if (!isBusinessPlan) return cardList;

    return cardList.filter((card) => {
      const linkedProfile = card.businessProfileId ? profileMap[card.businessProfileId] : null;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesCode = card.code.toLowerCase().includes(q);
        const matchesNickname = card.nickname?.toLowerCase().includes(q) ?? false;
        const matchesProfile = linkedProfile?.name.toLowerCase().includes(q) ?? false;
        if (!matchesCode && !matchesNickname && !matchesProfile) return false;
      }

      if (profileFilter !== "all") {
        if (profileFilter === "none") {
          if (card.businessProfileId !== null) return false;
        } else {
          if (String(card.businessProfileId) !== profileFilter) return false;
        }
      }

      if (platformFilter !== "all") {
        if (platformFilter === "none") {
          if (card.platform !== null) return false;
        } else {
          if (card.platform !== platformFilter) return false;
        }
      }

      if (statusFilter !== "all") {
        if (card.status !== statusFilter) return false;
      }

      return true;
    });
  }, [cardList, isBusinessPlan, search, profileFilter, platformFilter, statusFilter, profileMap]);

  const activeFilterTags: { key: string; label: string; onRemove: () => void }[] = [];
  if (search.trim()) {
    activeFilterTags.push({ key: "search", label: `"${search}"`, onRemove: () => setSearch("") });
  }
  if (profileFilter !== "all") {
    const name = profileFilter === "none"
      ? t("cards.filter.noProfileLinked")
      : (profileMap[Number(profileFilter)]?.name ?? profileFilter);
    activeFilterTags.push({ key: "profile", label: name, onRemove: () => setProfileFilter("all") });
  }
  if (platformFilter !== "all") {
    const label = platformFilter === "none" ? t("cards.filter.noPlatform") : platformFilter;
    activeFilterTags.push({ key: "platform", label, onRemove: () => setPlatformFilter("all") });
  }
  if (statusFilter !== "all") {
    activeFilterTags.push({ key: "status", label: t(`status.${statusFilter}`, statusFilter), onRemove: () => setStatusFilter("all") });
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1117]">{t("cards.title")}</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">{t("cards.subtitle")}</p>
          </div>
          <Link href="/activate">
            <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90 shrink-0" data-testid="button-activate-new">
              <Plus className="w-4 h-4 mr-2" />
              {t("cards.activateCard")}
            </Button>
          </Link>
        </div>

        {/* ── Filter bar — Business plan only ── */}
        {isBusinessPlan && !isLoading && cardList.length > 0 && (
          <div className="bg-white border border-border rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-semibold text-[#374151]">{t("cards.filter.filtersActive").replace(":", "")}</span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="ml-auto flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-red-500 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
                  data-testid="button-reset-filters"
                >
                  <X className="w-3 h-3" />
                  {t("cards.filter.reset")}
                </button>
              )}
            </div>

            {/* Filters row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("cards.filter.searchPlaceholder")}
                  className="pl-9 h-9 text-sm"
                  data-testid="input-card-search"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Profile filter */}
              <Select value={profileFilter} onValueChange={setProfileFilter}>
                <SelectTrigger className="h-9 text-sm" data-testid="select-profile-filter">
                  <Building2 className="w-3.5 h-3.5 text-[#9CA3AF] mr-1.5 shrink-0" />
                  <SelectValue placeholder={t("cards.filter.allProfiles")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("cards.filter.allProfiles")}</SelectItem>
                  <SelectItem value="none">{t("cards.filter.noProfileLinked")}</SelectItem>
                  {profileList.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Platform filter */}
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="h-9 text-sm" data-testid="select-platform-filter">
                  <SelectValue placeholder={t("cards.filter.allPlatforms")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("cards.filter.allPlatforms")}</SelectItem>
                  <SelectItem value="none">{t("cards.filter.noPlatform")}</SelectItem>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", platformColors[p])}>
                        {p}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-sm" data-testid="select-status-filter">
                  <SelectValue placeholder={t("cards.filter.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("cards.filter.allStatuses")}</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full", statusPill[s])}>
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDot[s])} />
                        {t(`status.${s}`, s)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active filter tags + result count */}
            {(activeFilterTags.length > 0 || hasActiveFilters) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-[#6B7280] font-medium">
                  {t("cards.filter.results", { count: filteredCards.length })}
                </span>
                {activeFilterTags.map((tag) => (
                  <span
                    key={tag.key}
                    className="inline-flex items-center gap-1 text-xs bg-primary/10 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-medium"
                  >
                    {tag.label}
                    <button
                      onClick={tag.onRemove}
                      className="ml-0.5 text-amber-600 hover:text-amber-900 transition-colors"
                      aria-label={`Remove filter ${tag.label}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Card list ── */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : cardList.length === 0 ? (
          <Card className="bg-white border border-border">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-[#0D1117] mb-2">{t("cards.noCards")}</h3>
              <p className="text-sm text-[#6B7280] mb-6 max-w-xs mx-auto">{t("cards.noCardsDesc")}</p>
              <Link href="/activate">
                <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90" data-testid="button-activate-first">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("cards.activateFirst")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredCards.length === 0 ? (
          <Card className="bg-white border border-border">
            <CardContent className="py-16 text-center">
              <div className="w-14 h-14 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-[#9CA3AF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0D1117] mb-2">{t("cards.filter.noResults")}</h3>
              <p className="text-sm text-[#6B7280] mb-6 max-w-xs mx-auto">{t("cards.filter.noResultsDesc")}</p>
              <Button variant="outline" onClick={resetFilters} data-testid="button-reset-empty">
                <X className="w-4 h-4 mr-2" />
                {t("cards.filter.reset")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map((card) => {
              const linkedProfile = card.businessProfileId ? profileMap[card.businessProfileId] : null;
              return (
                <Link key={card.id} href={`/cards/${card.id}`}>
                  <Card
                    className="bg-white border border-border shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/30"
                    data-testid={`card-product-${card.id}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        {linkedProfile?.logoUrl ? (
                          <img
                            src={linkedProfile.logoUrl}
                            alt={linkedProfile.name}
                            className="w-12 h-12 rounded-xl object-cover border border-border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#0D1117] rounded-xl flex items-center justify-center">
                            <span className="text-sm font-mono font-bold text-primary">{card.code.slice(0, 3)}</span>
                          </div>
                        )}
                        {(() => {
                          const dot = statusDot[card.status] ?? statusDot.disabled;
                          const pill = statusPill[card.status] ?? statusPill.disabled;
                          return (
                            <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full", pill)}>
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
                              {t(`status.${card.status}`, card.status)}
                            </span>
                          );
                        })()}
                      </div>

                      {card.nickname ? (
                        <p className="text-base font-bold text-[#0D1117] mb-0 truncate">{card.nickname}</p>
                      ) : linkedProfile ? (
                        <p className="text-base font-bold text-[#0D1117] mb-0 truncate">{linkedProfile.name}</p>
                      ) : (
                        <p className="text-base font-bold text-[#9CA3AF] mb-0">{t("cards.noName")}</p>
                      )}

                      {linkedProfile ? (
                        <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 max-w-full">
                          {linkedProfile.logoUrl ? (
                            <img src={linkedProfile.logoUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                              <span className="text-[8px] font-bold text-white leading-none">{linkedProfile.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <span className="text-xs font-medium text-amber-800 truncate">{linkedProfile.name}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB]">
                          <div className="w-3.5 h-3.5 rounded-full bg-[#D1D5DB] flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-bold text-white leading-none">?</span>
                          </div>
                          <span className="text-xs font-medium text-[#9CA3AF]">{t("cards.noProfileLabel")}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {card.smartReviewEnabled && (
                          <span className="text-xs bg-purple-100 text-purple-700 font-medium px-2 py-0.5 rounded">Smart</span>
                        )}
                        {card.platform ? (
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded", platformColors[card.platform] ?? "bg-gray-100 text-gray-700")}>
                            {card.platform}
                          </span>
                        ) : (
                          <span className="text-xs text-[#9CA3AF]">—</span>
                        )}
                        <span className={cn("text-xs font-mono px-2 py-0.5 rounded", card.platform ? platformColors[card.platform] ?? "bg-gray-100 text-gray-700" : "bg-[#F3F4F6] text-[#6B7280]")}>{card.code}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm border-t border-[#F3F4F6] pt-3 mt-3">
                        <div className="flex items-center gap-1.5 text-[#6B7280]">
                          <Activity className="w-3.5 h-3.5" />
                          <span className="font-semibold text-[#374151]">{card.scanCount}</span>
                          <span>{t("cards.scans")}</span>
                        </div>
                        {card.activatedAt && (
                          <p className="text-xs text-[#9CA3AF]">
                            {new Date(card.activatedAt).toLocaleDateString(i18n.language)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
