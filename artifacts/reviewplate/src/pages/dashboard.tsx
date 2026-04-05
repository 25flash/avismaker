import { AuthLayout } from "@/components/layout/AuthLayout";
import { useGetDashboardSummary, useListBusinessProfiles } from "@workspace/api-client-react";
import { CreditCard, Activity, TrendingUp, Building2, Star, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

function StatCard({ title, value, icon: Icon, subtitle, loading }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  loading?: boolean;
}) {
  return (
    <Card className="bg-white border border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-[#6B7280]">{title}</p>
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-3xl font-bold text-[#0D1117]" data-testid={`stat-${title.toLowerCase().replace(/\s/g, "-")}`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        )}
        {subtitle && <p className="text-xs text-[#6B7280] mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

const platformColors: Record<string, string> = {
  google: "bg-blue-100 text-blue-700",
  airbnb: "bg-red-100 text-red-700",
  tripadvisor: "bg-green-100 text-green-700",
  trustpilot: "bg-emerald-100 text-emerald-700",
  multilink: "bg-purple-100 text-purple-700",
  social: "bg-pink-100 text-pink-700",
};

interface DashboardProfile {
  id: number;
  name: string;
  logoUrl: string | null;
}

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardSummary();
  const { data: profilesData } = useListBusinessProfiles();
  const { user } = useAuth();
  const { t } = useTranslation();

  const summary = data as unknown as {
    totalCards: number;
    activeCards: number;
    totalScans: number;
    scansThisMonth: number;
    totalProfiles: number;
    recentScans: Array<{ id: number; cardId: number; cardCode: string; platform: string | null; businessProfileId: number | null; timestamp: string; country: string | null; deviceType: string | null; wasNegative: boolean }>;
    topCards: Array<{ id: number; code: string; status: string; platform: string | null; scanCount: number; smartReviewEnabled: boolean; businessProfileId: number | null }>;
  } | undefined;

  const profileMap = ((profilesData as unknown as DashboardProfile[]) ?? []).reduce<Record<number, DashboardProfile>>(
    (acc, p) => { acc[p.id] = p; return acc; },
    {}
  );

  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1117]">{t("dashboard.title")}</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">{t("dashboard.welcome", { name: user?.name })}</p>
          </div>
          <Link href="/activate">
            <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90 shrink-0" data-testid="button-activate-card">
              <Zap className="w-4 h-4 mr-2" />
              {t("dashboard.activateCard")}
            </Button>
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t("dashboard.totalCards")} value={summary?.totalCards ?? 0} icon={CreditCard} loading={isLoading} />
          <StatCard title={t("dashboard.activeCards")} value={summary?.activeCards ?? 0} icon={Activity} subtitle={t("dashboard.readyToScan")} loading={isLoading} />
          <StatCard title={t("dashboard.totalScans")} value={summary?.totalScans ?? 0} icon={TrendingUp} loading={isLoading} />
          <StatCard title={t("dashboard.thisMonth")} value={summary?.scansThisMonth ?? 0} icon={Star} subtitle={t("dashboard.scansThisMonth")} loading={isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top performing cards */}
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-[#0D1117]">{t("dashboard.topCards")}</CardTitle>
                <Link href="/cards">
                  <button className="text-xs text-primary hover:underline flex items-center gap-1">
                    {t("dashboard.viewAll")} <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : summary?.topCards?.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-10 h-10 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-sm text-[#6B7280]">{t("dashboard.noCards")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {summary?.topCards?.map((card) => {
                    const profile = card.businessProfileId ? profileMap[card.businessProfileId] : null;
                    return (
                      <Link key={card.id} href={`/cards/${card.id}`}>
                        <div
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                          data-testid={`card-top-${card.id}`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Logo du profil ou badge code */}
                            {profile?.logoUrl ? (
                              <img
                                src={profile.logoUrl}
                                alt={profile.name}
                                className="w-8 h-8 rounded-lg object-cover border border-border shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-xs font-mono font-bold text-primary">{card.code.slice(0, 2)}</span>
                              </div>
                            )}
                            <div>
                              {/* Nom de l'établissement en principal */}
                              <p className="text-sm font-semibold text-[#0D1117]">
                                {profile ? profile.name : card.code}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                {card.platform && (
                                  <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", platformColors[card.platform] ?? "bg-gray-100 text-gray-700")}>
                                    {card.platform}
                                  </span>
                                )}
                                {profile && (
                                  <span className="text-xs font-mono text-[#9CA3AF]">{card.code}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#0D1117]">{card.scanCount}</p>
                            <p className="text-xs text-[#6B7280]">{t("dashboard.scans")}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent scans */}
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold text-[#0D1117]">{t("dashboard.recentActivity")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : summary?.recentScans?.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-10 h-10 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-sm text-[#6B7280]">{t("dashboard.noActivity")}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {summary?.recentScans?.slice(0, 8).map((scan) => {
                    const scanProfile = scan.businessProfileId ? profileMap[scan.businessProfileId] : null;
                    return (
                      <div
                        key={scan.id}
                        className="flex items-center justify-between py-2.5 border-b border-[#F3F4F6] last:border-0"
                        data-testid={`row-scan-${scan.id}`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Logo ou dot de statut */}
                          {scanProfile?.logoUrl ? (
                            <img
                              src={scanProfile.logoUrl}
                              alt={scanProfile.name}
                              className="w-6 h-6 rounded object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className={cn("w-2 h-2 rounded-full shrink-0", scan.wasNegative ? "bg-red-400" : "bg-[#10B981]")} />
                          )}
                          <div>
                            {/* Nom de l'établissement en principal */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-[#374151]">
                                {scanProfile ? scanProfile.name : scan.cardCode}
                              </p>
                              {scan.platform && (
                                <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", platformColors[scan.platform] ?? "bg-gray-100 text-gray-700")}>
                                  {scan.platform}
                                </span>
                              )}
                            </div>
                            {/* Code carte + localisation en secondaire */}
                            <p className="text-xs text-[#6B7280]">
                              {scanProfile && <span className="font-mono mr-1">{scan.cardCode} ·</span>}
                              {scan.country ?? t("dashboard.unknown")} · {scan.deviceType ?? t("dashboard.unknown")}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-[#6B7280] shrink-0">
                          {new Date(scan.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#0D1117]">{t("dashboard.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: "/activate", label: t("dashboard.activateCardAction"), icon: Zap, color: "bg-amber-50 text-amber-700 hover:bg-amber-100", testId: "button-quick-activate-card" },
                { href: "/profiles", label: t("dashboard.addBusiness"), icon: Building2, color: "bg-blue-50 text-blue-700 hover:bg-blue-100", testId: "button-quick-add-business" },
                { href: "/ai-reply", label: t("dashboard.aiReply"), icon: Star, color: "bg-purple-50 text-purple-700 hover:bg-purple-100", testId: "button-quick-ai-reply" },
                { href: "/billing", label: t("dashboard.upgradePlan"), icon: TrendingUp, color: "bg-green-50 text-green-700 hover:bg-green-100", testId: "button-quick-upgrade-plan" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <button
                    className={cn("w-full flex flex-col items-center gap-2 p-4 rounded-xl transition-colors text-sm font-medium", action.color)}
                    data-testid={action.testId}
                  >
                    <action.icon className="w-5 h-5" />
                    {action.label}
                  </button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
