import { AuthLayout } from "@/components/layout/AuthLayout";
import { useGetDashboardSummary, useListBusinessProfiles } from "@workspace/api-client-react";
import {
  CreditCard, Activity, TrendingUp, Building2, Star, Zap,
  ArrowRight, BarChart2, ChevronRight, ArrowUpRight, ArrowDownRight,
  Trophy, AlertTriangle, Users, Target, Lock,
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

function StatCard({ title, value, icon: Icon, subtitle, loading, accentColor = "#F59E0B", iconBg = "bg-primary/10", iconColor = "text-primary" }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  loading?: boolean;
  accentColor?: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <Card className="bg-white border border-border shadow-sm overflow-hidden" style={{ height: 70, borderLeft: `4px solid ${accentColor}` }}>
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
        <div className={cn("shrink-0 w-6 h-6 rounded-md flex items-center justify-center self-start mt-0.5", iconBg)}>
          <Icon style={{ width: 14, height: 14 }} className={iconColor} />
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
      <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer group">
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

const METRIC_BOX_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  "Taux de conversion": { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
  "Moy. scans / carte": { bg: "bg-violet-50", icon: "text-violet-500", border: "border-violet-100" },
  "Évolution": { bg: "bg-emerald-50", icon: "text-emerald-500", border: "border-emerald-100" },
  "Top performer": { bg: "bg-amber-50", icon: "text-amber-500", border: "border-amber-100" },
  "Moins performante": { bg: "bg-red-50", icon: "text-red-400", border: "border-red-100" },
  "Nouveaux visiteurs": { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-100" },
};

function MetricBox({
  label, value, icon: Icon, positive, neutral, suffix, locked = false,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  positive?: boolean;
  neutral?: boolean;
  suffix?: string;
  locked?: boolean;
}) {
  const colorKey = Object.keys(METRIC_BOX_COLORS).find(k => label.startsWith(k)) ?? "";
  const colors = METRIC_BOX_COLORS[colorKey] ?? { bg: "bg-gray-50", icon: "text-gray-500", border: "border-gray-100" };

  const inner = (
    <div className={cn("rounded-xl px-3 py-3 border flex flex-col gap-1", colors.bg, colors.border)}>
      <div className={cn("flex items-center gap-1.5", colors.icon)}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <p className="text-[10px] font-semibold uppercase tracking-wide leading-none">{label}</p>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
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

  if (!locked) return inner;

  return (
    <div className="relative group">
      <div className="blur-sm opacity-50 pointer-events-none select-none group-hover:blur-[2px] group-hover:opacity-65 transition-all duration-200">
        {inner}
      </div>
      <Link href="/billing">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl">
          <Lock className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-[9px] font-semibold text-[#6B7280] text-center leading-tight px-1">
            Business
          </span>
        </div>
      </Link>
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
  const metrics = realData;
  const chartData = realAnalytics
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
      locked: true,
    },
    {
      label: "Moy. scans / carte",
      value: metrics.avgScansPerCard,
      suffix: "",
      icon: BarChart2,
      neutral: true,
      positive: undefined,
      locked: true,
    },
    {
      label: `Évolution (${period})`,
      value: `${metrics.trend >= 0 ? "+" : ""}${metrics.trend}`,
      suffix: "%",
      icon: TrendingUp,
      positive: metrics.trend >= 0,
      neutral: false,
      locked: true,
    },
    {
      label: "Top performer",
      value: metrics.topCard.length > 14 ? metrics.topCard.slice(0, 14) + "…" : metrics.topCard,
      suffix: "",
      icon: Trophy,
      positive: true,
      neutral: false,
      locked: false,
    },
    {
      label: "Moins performante",
      value: metrics.worstCard.length > 14 ? metrics.worstCard.slice(0, 14) + "…" : metrics.worstCard,
      suffix: "",
      icon: AlertTriangle,
      positive: false,
      neutral: false,
      locked: false,
    },
    {
      label: "Nouveaux visiteurs",
      value: `${metrics.newVsReturning}`,
      suffix: "%",
      icon: Users,
      positive: true,
      neutral: false,
      locked: true,
    },
  ];

  const content = (
    <div className="flex flex-col gap-4">
      {/* Period filter + upgrade CTA */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
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
        {!isBusiness && (
          <Link href="/billing">
            <button className="flex items-center gap-1.5 text-[10px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full transition-colors shrink-0">
              <Lock className="w-3 h-3" />
              Passer en Business
            </button>
          </Link>
        )}
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
              locked={!isBusiness && m.locked}
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
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} label={{ value: "Dates", position: "insideBottomRight", offset: -4, fontSize: 9, fill: "#C1C9D4" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} label={{ value: "Scans", angle: -90, position: "insideLeft", offset: 12, fontSize: 9, fill: "#C1C9D4" }} />
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
            <h1 className="text-3xl font-extrabold text-[#0D1117] tracking-tight">{t("dashboard.title")}</h1>
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
          <StatCard title="Nbr Profils" value={summary?.totalProfiles ?? 0} icon={Building2} loading={isLoading} accentColor="#3B82F6" iconBg="bg-blue-50" iconColor="text-blue-500" />
          <StatCard title={t("dashboard.activeCards")} value={summary ? `${summary.activeCards}/${summary.totalCards}` : "–"} icon={Activity} loading={isLoading} accentColor="#10B981" iconBg="bg-emerald-50" iconColor="text-emerald-500" />
          <StatCard title={t("dashboard.totalScans")} value={summary?.totalScans ?? 0} icon={TrendingUp} loading={isLoading} accentColor="#8B5CF6" iconBg="bg-violet-50" iconColor="text-violet-500" />
          <StatCard title={t("dashboard.thisMonth")} value={summary?.scansThisMonth ?? 0} icon={Star} subtitle={t("dashboard.scansThisMonth")} loading={isLoading} accentColor="#F59E0B" iconBg="bg-amber-50" iconColor="text-amber-500" />
        </div>

        {/* Main grid — 3 cols on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* 1. Meilleures cartes */}
          <Card className="bg-white border border-border shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-[#0D1117]">{t("dashboard.topCards")}</CardTitle>
                <Link href="/cards">
                  <button className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors">
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
                  <button className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors">
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
                { href: "/activate", label: t("dashboard.activateCardAction"), icon: Zap, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", hover: "hover:bg-amber-100 hover:border-amber-300", testId: "button-quick-activate-card" },
                { href: "/profiles", label: t("dashboard.addBusiness"), icon: Building2, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", hover: "hover:bg-blue-100 hover:border-blue-300", testId: "button-quick-add-business" },
                { href: "/ai-reply", label: t("dashboard.aiReply"), icon: Star, bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", hover: "hover:bg-purple-100 hover:border-purple-300", testId: "button-quick-ai-reply" },
                { href: "/billing", label: t("dashboard.upgradePlan"), icon: TrendingUp, bg: "bg-green-50", text: "text-green-700", border: "border-green-200", hover: "hover:bg-green-100 hover:border-green-300", testId: "button-quick-upgrade-plan" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <button
                    className={cn("w-full flex flex-col items-center gap-2 p-4 rounded-xl transition-all text-sm font-bold border", action.bg, action.text, action.border, action.hover)}
                    data-testid={action.testId}
                  >
                    <action.icon className="w-6 h-6" />
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
