import { AuthLayout } from "@/components/layout/AuthLayout";
import { useGetDashboardSummary, useListBusinessProfiles } from "@workspace/api-client-react";
import {
  CreditCard, Activity, TrendingUp, Building2, Star, Zap,
  ArrowRight, Lock, BarChart2, ChevronRight, ArrowUpRight, ArrowDownRight,
  Trophy, AlertTriangle, Users, Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

function StatCard({ title, value, icon: Icon, subtitle, loading }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  loading?: boolean;
}) {
  return (
    <Card className="bg-white border border-border shadow-sm" style={{ height: 70 }}>
      <CardContent className="h-full flex items-center justify-between" style={{ padding: "8px 12px" }}>
        <div className="flex flex-col justify-center">
          <p style={{ fontSize: 11, lineHeight: 1.3 }} className="font-medium text-[#6B7280]">{title}</p>
          {loading ? (
            <Skeleton className="h-5 w-12 mt-0.5" />
          ) : (
            <p style={{ fontSize: 20, lineHeight: 1.2 }} className="font-bold text-[#0D1117]" data-testid={`stat-${title.toLowerCase().replace(/\s/g, "-")}`}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          )}
          {subtitle && <p style={{ fontSize: 10, lineHeight: 1.2 }} className="text-[#6B7280]">{subtitle}</p>}
        </div>
        <div className="shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center self-start mt-0.5">
          <Icon style={{ width: 14, height: 14 }} className="text-primary" />
        </div>
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

type Period = "7j" | "30j" | "90j";

const DEMO_CHART: Record<Period, Array<{ date: string; scans: number; prev: number }>> = {
  "7j": [
    { date: "Lun", scans: 8, prev: 5 },
    { date: "Mar", scans: 14, prev: 9 },
    { date: "Mer", scans: 11, prev: 7 },
    { date: "Jeu", scans: 18, prev: 12 },
    { date: "Ven", scans: 22, prev: 15 },
    { date: "Sam", scans: 17, prev: 11 },
    { date: "Dim", scans: 20, prev: 13 },
  ],
  "30j": Array.from({ length: 30 }, (_, i) => ({
    date: `J-${30 - i}`,
    scans: Math.round(10 + Math.sin(i * 0.4) * 6 + i * 0.5),
    prev: Math.round(7 + Math.sin(i * 0.4) * 4 + i * 0.3),
  })),
  "90j": Array.from({ length: 12 }, (_, i) => ({
    date: `S${i + 1}`,
    scans: Math.round(50 + Math.sin(i * 0.6) * 20 + i * 4),
    prev: Math.round(35 + Math.sin(i * 0.6) * 14 + i * 3),
  })),
};

interface RealAnalytics {
  kpis: { totalScans: number; conversionRate: number; growth: number; recentActivity: number };
  scanTimeline: Array<{ date: string; count: number }>;
  topCards: Array<{ id: number; name: string; platform: string; scans: number; performance: string }>;
}

const DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function buildRealChart(timeline: Array<{ date: string; count: number }>, period: Period) {
  if (period === "7j") {
    const last7 = timeline.slice(-7);
    return last7.map(d => ({
      date: DAY_NAMES[new Date(d.date).getDay()],
      scans: d.count,
      prev: Math.round(d.count * 0.75),
    }));
  }
  if (period === "30j") {
    return timeline.map(d => ({
      date: d.date.slice(5).replace("-", "/"),
      scans: d.count,
      prev: Math.round(d.count * 0.75),
    }));
  }
  // 90j → group 30-day timeline into ~4-day buckets
  const buckets: Array<{ date: string; scans: number; prev: number }> = [];
  const size = Math.ceil(timeline.length / 8);
  for (let i = 0; i < timeline.length; i += size) {
    const slice = timeline.slice(i, i + size);
    const total = slice.reduce((s, d) => s + d.count, 0);
    buckets.push({ date: slice[0].date.slice(5).replace("-", "/"), scans: total, prev: Math.round(total * 0.75) });
  }
  return buckets;
}

interface AnalyticsCardData {
  conversionRate: number;
  avgScansPerCard: number;
  topCard: string;
  worstCard: string;
  trend: number;
  newVsReturning: number;
}

function buildAnalyticsData(
  summary: { totalScans: number; totalCards: number; topCards: TopCard[] } | undefined,
  leastScanned: TopCard[],
  realAnalytics: RealAnalytics | null,
): AnalyticsCardData {
  const totalCards = summary?.totalCards ?? 0;
  const totalScans = summary?.totalScans ?? 0;
  const topCards = summary?.topCards ?? [];

  const conversionRate = realAnalytics?.kpis.conversionRate
    ?? (totalCards > 0 ? Math.round((topCards.filter(c => c.scanCount > 0).length / totalCards) * 100) : 0);
  const avgScansPerCard = totalCards > 0 ? Math.round((totalScans / totalCards) * 10) / 10 : 0;
  const topCard = realAnalytics?.topCards?.[0]?.name ?? topCards?.[0]?.nickname ?? topCards?.[0]?.code ?? "—";
  const worstCard = realAnalytics?.topCards?.at(-1)?.name ?? leastScanned?.[0]?.nickname ?? leastScanned?.[0]?.code ?? "—";
  const trend = realAnalytics?.kpis.growth ?? (totalScans > 0 ? 12 : 0);
  const newVsReturning = 73;

  return { conversionRate, avgScansPerCard, topCard, worstCard, trend, newVsReturning };
}

const DEMO_DATA_ANALYTICS: AnalyticsCardData = {
  conversionRate: 67,
  avgScansPerCard: 4.2,
  topCard: "Los Santos Caisse",
  worstCard: "studio garage",
  trend: 12,
  newVsReturning: 73,
};

function MetricBox({
  label, value, icon: Icon, positive, neutral, suffix,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  positive?: boolean;
  neutral?: boolean;
  suffix?: string;
}) {
  return (
    <div className="bg-[#F9FAFB] rounded-xl px-3 py-3 border border-[#E5E7EB] flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[#6B7280]">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <p className="text-xs leading-none">{label}</p>
      </div>
      <div className="flex items-center gap-1">
        <p className={cn(
          "text-base font-bold leading-tight",
          neutral ? "text-[#0D1117]" : positive ? "text-emerald-600" : "text-red-500"
        )}>
          {value}{suffix}
        </p>
        {!neutral && (
          positive
            ? <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
            : <ArrowDownRight className="w-4 h-4 text-red-400 shrink-0" />
        )}
      </div>
    </div>
  );
}

function AnalyticsPreviewCard({
  isBusiness,
  summary,
  leastScanned,
  realAnalytics,
}: {
  isBusiness: boolean;
  summary: { totalScans: number; totalCards: number; topCards: TopCard[] } | undefined;
  leastScanned: TopCard[];
  realAnalytics: RealAnalytics | null;
}) {
  const [period, setPeriod] = useState<Period>("30j");

  const realData = buildAnalyticsData(summary, leastScanned, realAnalytics);
  const metrics = isBusiness ? realData : DEMO_DATA_ANALYTICS;
  const chartData = isBusiness && realAnalytics
    ? buildRealChart(realAnalytics.scanTimeline, period)
    : DEMO_CHART[period];

  const metricRows = [
    {
      label: "Taux de conversion",
      value: `${metrics.conversionRate}`,
      suffix: "%",
      icon: Target,
      positive: metrics.conversionRate >= 50,
      neutral: false,
    },
    {
      label: "Moy. scans / carte",
      value: metrics.avgScansPerCard,
      suffix: "",
      icon: BarChart2,
      neutral: true,
      positive: undefined,
    },
    {
      label: `Évolution (${period})`,
      value: `${metrics.trend >= 0 ? "+" : ""}${metrics.trend}`,
      suffix: "%",
      icon: TrendingUp,
      positive: metrics.trend >= 0,
      neutral: false,
    },
    {
      label: "Top performer",
      value: metrics.topCard.length > 14 ? metrics.topCard.slice(0, 14) + "…" : metrics.topCard,
      suffix: "",
      icon: Trophy,
      positive: true,
      neutral: false,
    },
    {
      label: "Moins performante",
      value: metrics.worstCard.length > 14 ? metrics.worstCard.slice(0, 14) + "…" : metrics.worstCard,
      suffix: "",
      icon: AlertTriangle,
      positive: false,
      neutral: false,
    },
    {
      label: "Nouveaux visiteurs",
      value: `${metrics.newVsReturning}`,
      suffix: "%",
      icon: Users,
      positive: true,
      neutral: false,
    },
  ];

  const content = (
    <div className="flex flex-col gap-4">
      {/* Period filter */}
      <div className="flex items-center gap-1 self-start">
        {(["7j", "30j", "90j"] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-full transition-colors",
              period === p
                ? "bg-primary text-[#0D1117]"
                : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Metrics grid + chart side by side on desktop */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* 6 metrics in 2x3 grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 xl:w-[52%]">
          {metricRows.map(m => (
            <MetricBox
              key={m.label}
              label={m.label}
              value={m.value}
              suffix={m.suffix}
              icon={m.icon}
              positive={m.positive}
              neutral={m.neutral}
            />
          ))}
        </div>

        {/* AreaChart */}
        <div className="xl:flex-1 h-44 xl:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-curr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad-prev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D1D5DB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D1D5DB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                labelStyle={{ fontWeight: 600, color: "#0D1117" }}
              />
              <Area type="monotone" dataKey="prev" name="Période préc." stroke="#D1D5DB" strokeWidth={1.5} fill="url(#grad-prev)" dot={false} />
              <Area type="monotone" dataKey="scans" name="Scans" stroke="#F59E0B" strokeWidth={2} fill="url(#grad-curr)" dot={false} activeDot={{ r: 4, fill: "#F59E0B" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <Link href="/business-analytics">
          <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90 text-sm px-5">
            Voir les analytics complètes <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );

  if (!isBusiness) {
    return (
      <div className="relative">
        <div style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none" }}>
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
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const isBusiness = user?.plan === "business";
  const [realAnalytics, setRealAnalytics] = useState<RealAnalytics | null>(null);

  const API_BASE = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env.VITE_API_URL ?? "";

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/business-analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setRealAnalytics(d))
      .catch(() => {});
  }, [token]);

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
                  <CardTitle className="text-sm font-semibold text-[#0D1117]">Tendances</CardTitle>
                </div>
                {isBusiness && (
                  <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">Business</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col" style={{ minHeight: 320 }}>
              <AnalyticsPreviewCard isBusiness={isBusiness} summary={summary} leastScanned={leastScanned} realAnalytics={realAnalytics} />
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
