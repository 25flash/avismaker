import { AuthLayout } from "@/components/layout/AuthLayout";
import { useGetDashboardSummary, useListBusinessProfiles } from "@workspace/api-client-react";
import {
  CreditCard, Activity, TrendingUp, Building2, Star, Zap,
  ArrowRight, Lock, BarChart2, ChevronRight,
} from "lucide-react";
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

type TopCard = {
  id: number;
  code: string;
  nickname: string | null;
  status: string;
  platform: string | null;
  scanCount: number;
  smartReviewEnabled: boolean;
  businessProfileId: number | null;
};

function CardRow({
  card,
  profile,
  t,
}: {
  card: TopCard;
  profile: DashboardProfile | null;
  t: (k: string) => string;
}) {
  return (
    <Link href={`/cards/${card.id}`}>
      <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer">
        <div className="flex items-center gap-2.5 min-w-0">
          {profile?.logoUrl ? (
            <img src={profile.logoUrl} alt={profile.name} className="w-7 h-7 rounded-lg object-cover border border-border shrink-0" />
          ) : (
            <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xs font-mono font-bold text-primary">{card.code.slice(0, 2)}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0D1117] truncate">
              {card.nickname ?? (profile ? profile.name : card.code)}
            </p>
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              {profile && (
                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full truncate max-w-[90px]">
                  {profile.name}
                </span>
              )}
              {card.platform && (
                <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", platformColors[card.platform] ?? "bg-gray-100 text-gray-700")}>
                  {card.platform}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <p className="text-sm font-bold text-[#0D1117]">{card.scanCount}</p>
          <p className="text-xs text-[#6B7280]">{t("dashboard.scans")}</p>
        </div>
      </div>
    </Link>
  );
}

const DEMO_SPARKLINE = [4, 7, 5, 9, 6, 11, 8, 13, 10, 14, 12, 16, 11, 15, 13, 17, 14, 18, 16, 20];

function AnalyticsPreviewCard({ isBusiness }: { isBusiness: boolean }) {
  const max = Math.max(...DEMO_SPARKLINE);

  const kpis = [
    { label: "Total scans", value: "1 248", color: "text-[#0D1117]" },
    { label: "Croissance", value: "+12 %", color: "text-emerald-600" },
    { label: "Ce mois", value: "342", color: "text-[#0D1117]" },
    { label: "Satisfaction", value: "94 %", color: "text-emerald-600" },
  ];

  const content = (
    <div className="flex flex-col xl:flex-row xl:items-center gap-4 h-full">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:flex-1">
        {kpis.map((k) => (
          <div key={k.label} className="bg-[#F9FAFB] rounded-lg px-3 py-2.5 border border-[#E5E7EB]">
            <p className="text-xs text-[#6B7280] mb-0.5">{k.label}</p>
            <p className={cn("text-base font-bold", k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div className="flex items-end gap-0.5 h-10 xl:flex-1 xl:h-12">
        {DEMO_SPARKLINE.map((v, i) => (
          <div
            key={i}
            className="flex-1 bg-amber-300 rounded-sm hover:bg-amber-400 transition-colors"
            style={{ height: `${(v / max) * 100}%` }}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="xl:shrink-0">
        <Link href="/business-analytics">
          <Button className="w-full xl:w-auto bg-primary text-[#0D1117] font-semibold hover:bg-primary/90 text-sm px-5">
            Voir les analytics <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );

  if (!isBusiness) {
    return (
      <div className="relative h-full flex flex-col">
        <div className="flex-1" style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none" }}>
          {content}
        </div>
        <div className="absolute inset-0 flex flex-col xl:flex-row items-center justify-center bg-white/75 rounded-lg gap-3 px-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-gray-500" />
          </div>
          <p className="text-sm font-semibold text-[#0D1117] text-center xl:text-left leading-tight">
            Débloquez les Analytics avancées
          </p>
          <Link href="/billing">
            <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90 text-sm px-5 shrink-0">
              Passer à Business
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return content;
}

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardSummary();
  const { data: profilesData } = useListBusinessProfiles();
  const { user } = useAuth();
  const { t } = useTranslation();

  const isBusiness = user?.plan === "business";

  const summary = data as unknown as {
    totalCards: number;
    activeCards: number;
    totalScans: number;
    scansThisMonth: number;
    totalProfiles: number;
    recentScans: Array<{
      id: number; cardId: number; cardCode: string;
      platform: string | null; businessProfileId: number | null;
      timestamp: string; country: string | null;
      deviceType: string | null; wasNegative: boolean;
    }>;
    topCards: TopCard[];
  } | undefined;

  const profileMap = ((profilesData as unknown as DashboardProfile[]) ?? []).reduce<Record<number, DashboardProfile>>(
    (acc, p) => { acc[p.id] = p; return acc; },
    {}
  );

  const topCards = summary?.topCards ?? [];
  const leastScanned = [...topCards].sort((a, b) => a.scanCount - b.scanCount);

  return (
    <AuthLayout>
      <div className="space-y-6">
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

        {/* Stats KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t("dashboard.totalCards")} value={summary?.totalCards ?? 0} icon={CreditCard} loading={isLoading} />
          <StatCard title={t("dashboard.activeCards")} value={summary?.activeCards ?? 0} icon={Activity} subtitle={t("dashboard.readyToScan")} loading={isLoading} />
          <StatCard title={t("dashboard.totalScans")} value={summary?.totalScans ?? 0} icon={TrendingUp} loading={isLoading} />
          <StatCard title={t("dashboard.thisMonth")} value={summary?.scansThisMonth ?? 0} icon={Star} subtitle={t("dashboard.scansThisMonth")} loading={isLoading} />
        </div>

        {/* Main grid — 3 cols on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* 1. Meilleures cartes */}
          <Card className="bg-white border border-border shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-[#0D1117]">{t("dashboard.topCards")}</CardTitle>
                <Link href="/cards">
                  <button className="text-xs text-primary hover:underline flex items-center gap-1">
                    {t("dashboard.viewAll")} <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex-1 overflow-y-auto" style={{ maxHeight: 260 }}>
              {isLoading ? (
                <div className="space-y-2 pt-1">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-11 w-full" />)}
                </div>
              ) : topCards.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-xs text-[#6B7280]">{t("dashboard.noCards")}</p>
                </div>
              ) : (
                <div className="space-y-0.5 pt-1">
                  {topCards.slice(0, 3).map(card => (
                    <CardRow key={card.id} card={card} profile={card.businessProfileId ? profileMap[card.businessProfileId] : null} t={t} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Cartes les moins scannées */}
          <Card className="bg-white border border-border shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-[#0D1117]">Cartes peu scannées</CardTitle>
                <Link href="/cards">
                  <button className="text-xs text-primary hover:underline flex items-center gap-1">
                    Voir tout <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex-1 overflow-y-auto" style={{ maxHeight: 260 }}>
              {isLoading ? (
                <div className="space-y-2 pt-1">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-11 w-full" />)}
                </div>
              ) : leastScanned.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-xs text-[#6B7280]">{t("dashboard.noCards")}</p>
                </div>
              ) : (
                <div className="space-y-0.5 pt-1">
                  {leastScanned.slice(0, 3).map(card => (
                    <CardRow key={card.id} card={card} profile={card.businessProfileId ? profileMap[card.businessProfileId] : null} t={t} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Activité récente */}
          <Card className="bg-white border border-border shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border shrink-0">
              <CardTitle className="text-sm font-semibold text-[#0D1117]">{t("dashboard.recentActivity")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 flex-1 overflow-y-auto" style={{ maxHeight: 260 }}>
              {isLoading ? (
                <div className="space-y-2 pt-1">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (summary?.recentScans?.length ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-xs text-[#6B7280]">{t("dashboard.noActivity")}</p>
                </div>
              ) : (
                <div className="pt-1">
                  {summary?.recentScans?.slice(0, 6).map((scan) => {
                    const scanProfile = scan.businessProfileId ? profileMap[scan.businessProfileId] : null;
                    return (
                      <div
                        key={scan.id}
                        className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0"
                        data-testid={`row-scan-${scan.id}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {scanProfile?.logoUrl ? (
                            <img src={scanProfile.logoUrl} alt={scanProfile.name} className="w-5 h-5 rounded object-cover border border-border shrink-0" />
                          ) : (
                            <div className={cn("w-2 h-2 rounded-full shrink-0", scan.wasNegative ? "bg-red-400" : "bg-[#10B981]")} />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-medium text-[#374151] truncate">
                                {scanProfile ? scanProfile.name : scan.cardCode}
                              </p>
                              {scan.platform && (
                                <span className={cn("text-xs px-1 py-0.5 rounded font-medium", platformColors[scan.platform] ?? "bg-gray-100 text-gray-700")}>
                                  {scan.platform}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#6B7280] truncate">
                              {scan.country ?? t("dashboard.unknown")} · {scan.deviceType ?? t("dashboard.unknown")}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-[#6B7280] shrink-0 ml-2">
                          {new Date(scan.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Analytics avancées — full width on tablet (md) and desktop (xl) */}
          <Card className="bg-white border border-border shadow-sm flex flex-col md:col-span-2 xl:col-span-3">
            <CardHeader className="pb-3 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold text-[#0D1117]">Analytics avancées</CardTitle>
                </div>
                {isBusiness && (
                  <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">Business</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-3 flex-1 flex flex-col" style={{ minHeight: 90 }}>
              <AnalyticsPreviewCard isBusiness={isBusiness} />
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
