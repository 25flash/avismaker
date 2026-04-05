import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart2, TrendingUp, Activity, Users, Lock, Download,
  Loader2, FileDown, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const PLATFORM_COLORS: Record<string, string> = {
  google: "#4285F4",
  tripadvisor: "#34A853",
  airbnb: "#FF385C",
  trustpilot: "#00B67A",
  other: "#F59E0B",
};

const PERFORMANCE_COLOR: Record<string, string> = {
  high: "text-green-600 bg-green-50",
  medium: "text-amber-600 bg-amber-50",
  low: "text-gray-500 bg-gray-50",
};

interface AnalyticsData {
  kpis: { totalScans: number; conversionRate: number; growth: number; recentActivity: number };
  scanTimeline: Array<{ date: string; count: number }>;
  sourceDistribution: Array<{ name: string; value: number }>;
  topCards: Array<{ id: number; name: string; platform: string; scans: number; status: string; performance: string }>;
}

const DEMO_DATA: AnalyticsData = {
  kpis: { totalScans: 1240, conversionRate: 82, growth: 27, recentActivity: 348 },
  scanTimeline: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
    count: Math.floor(Math.random() * 25 + 5),
  })),
  sourceDistribution: [
    { name: "google", value: 620 },
    { name: "tripadvisor", value: 280 },
    { name: "airbnb", value: 215 },
    { name: "trustpilot", value: 125 },
  ],
  topCards: [
    { id: 1, name: "Table principale", platform: "google", scans: 420, status: "active", performance: "high" },
    { id: 2, name: "Entrée restaurant", platform: "tripadvisor", scans: 230, status: "active", performance: "high" },
    { id: 3, name: "Bar lounge", platform: "google", scans: 185, status: "active", performance: "medium" },
    { id: 4, name: "Terrasse", platform: "airbnb", scans: 120, status: "active", performance: "medium" },
    { id: 5, name: "Réception hôtel", platform: "trustpilot", scans: 65, status: "active", performance: "low" },
  ],
};

function BlurWrapper({ children, locked }: { children: React.ReactNode; locked: boolean }) {
  const [, navigate] = useLocation();
  if (!locked) return <>{children}</>;
  return (
    <div className="relative">
      <div style={{ filter: "blur(6px)", pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center animate-in fade-in duration-300">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-border px-8 py-7 flex flex-col items-center gap-3 max-w-xs text-center mx-4">
          <div className="w-12 h-12 rounded-full bg-[#0D1117] flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <p className="font-bold text-[#0D1117] text-sm leading-tight">
            Débloquez les Analytics avancées avec Business
          </p>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Accédez aux statistiques complètes et exportez vos rapports
          </p>
          <Button
            size="sm"
            className="mt-1 bg-[#0D1117] text-primary hover:bg-[#0D1117]/90 font-semibold text-xs px-5"
            onClick={() => navigate("/billing")}
            title="Disponible avec Business"
          >
            Passer à Business
          </Button>
          <p className="text-[11px] text-primary font-medium">
            Vous pourriez générer +32% avec ces insights
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BusinessAnalyticsPage() {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null); // kept for potential future use

  const isBusiness = user?.plan === "business";
  const displayData = isBusiness ? (data ?? DEMO_DATA) : DEMO_DATA;

  useEffect(() => {
    if (!isBusiness) { setLoading(false); return; }
    const tk = token ?? localStorage.getItem("reviewplate_token");
    if (!tk) { setLoading(false); return; }
    fetch(`${API_BASE}/api/business-analytics`, {
      headers: { Authorization: `Bearer ${tk}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isBusiness, token]);

  const handleExportPDF = async () => {
    if (!isBusiness) { setShowUpgradeModal(true); return; }
    setExportLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = pdf.internal.pageSize.getWidth();   // 210
      const H = pdf.internal.pageSize.getHeight();  // 297
      const M = 14; // margin
      let y = 0;

      const AMBER  = [245, 158, 11]  as [number, number, number];
      const DARK   = [13, 17, 23]    as [number, number, number];
      const GRAY   = [107, 114, 128] as [number, number, number];
      const LIGHT  = [249, 250, 251] as [number, number, number];
      const BORDER = [229, 231, 235] as [number, number, number];

      // ── Header ────────────────────────────────────────────────────
      pdf.setFillColor(...DARK);
      pdf.rect(0, 0, W, 24, "F");

      // Logo placeholder (amber square)
      pdf.setFillColor(...AMBER);
      pdf.roundedRect(M, 5, 14, 14, 2, 2, "F");
      pdf.setTextColor(...DARK);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("AM", M + 2.5, 13.5);

      pdf.setTextColor(...AMBER);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text("AvisMaker", M + 17, 13);
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Analytics avancées", M + 17, 19.5);

      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.text(`Rapport généré le ${new Date().toLocaleDateString("fr-FR")}`, W - M, 11, { align: "right" });
      pdf.text(`contact@avismaker.com`, W - M, 17, { align: "right" });
      y = 32;

      // ── Section title helper ────────────────────────────────────
      const sectionTitle = (title: string) => {
        pdf.setFillColor(...AMBER);
        pdf.rect(M, y, 3, 5, "F");
        pdf.setTextColor(...DARK);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, M + 6, y + 4);
        y += 9;
      };

      // ── KPI Cards ─────────────────────────────────────────────────
      sectionTitle("Indicateurs clés de performance");

      const kd = displayData?.kpis ?? { totalScans: 0, conversionRate: 0, growth: 0, recentActivity: 0 };
      const kpiItems = [
        { label: "Total scans",        value: kd.totalScans.toLocaleString("fr-FR") },
        { label: "Taux de satisfaction", value: `${kd.conversionRate}%` },
        { label: "Croissance (30j)",   value: `${kd.growth >= 0 ? "+" : ""}${kd.growth}%` },
        { label: "Activité récente",   value: kd.recentActivity.toLocaleString("fr-FR") },
      ];

      const kpiW = (W - M * 2 - 9) / 4;
      kpiItems.forEach((k, i) => {
        const x = M + i * (kpiW + 3);
        pdf.setFillColor(...LIGHT);
        pdf.setDrawColor(...BORDER);
        pdf.roundedRect(x, y, kpiW, 22, 2, 2, "FD");
        pdf.setTextColor(...DARK);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(k.value, x + kpiW / 2, y + 12, { align: "center" });
        pdf.setTextColor(...GRAY);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.text(k.label, x + kpiW / 2, y + 18, { align: "center" });
      });
      y += 28;

      // ── Scan timeline chart ────────────────────────────────────────
      sectionTitle("Évolution des scans — 30 derniers jours");

      const timeline = displayData?.scanTimeline ?? [];
      const chartX = M;
      const chartY = y;
      const chartW = W - M * 2;
      const chartH = 40;
      const maxCount = Math.max(...timeline.map(d => d.count), 1);

      // Background
      pdf.setFillColor(...LIGHT);
      pdf.setDrawColor(...BORDER);
      pdf.roundedRect(chartX, chartY, chartW, chartH + 8, 2, 2, "FD");

      // Grid lines
      pdf.setDrawColor(...BORDER);
      pdf.setLineWidth(0.2);
      for (let g = 0; g <= 4; g++) {
        const gy = chartY + 4 + chartH - (g / 4) * chartH;
        pdf.line(chartX + 4, gy, chartX + chartW - 4, gy);
      }

      // Line chart
      if (timeline.length > 1) {
        pdf.setDrawColor(...AMBER);
        pdf.setLineWidth(0.8);
        const pts = timeline.map((d, i) => ({
          x: chartX + 4 + (i / (timeline.length - 1)) * (chartW - 8),
          y: chartY + 4 + chartH - (d.count / maxCount) * chartH,
        }));
        for (let i = 1; i < pts.length; i++) {
          pdf.line(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
        }
        // Dots
        pdf.setFillColor(...AMBER);
        pts.filter((_, i) => i % 5 === 0).forEach(p => {
          pdf.circle(p.x, p.y, 0.8, "F");
        });
      }

      // X-axis labels
      pdf.setTextColor(...GRAY);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      const labelIdxs = [0, Math.floor(timeline.length / 3), Math.floor(2 * timeline.length / 3), timeline.length - 1];
      labelIdxs.forEach(i => {
        if (timeline[i]) {
          const lx = chartX + 4 + (i / Math.max(timeline.length - 1, 1)) * (chartW - 8);
          pdf.text(timeline[i].date.slice(5), lx, chartY + chartH + 10, { align: "center" });
        }
      });
      y += chartH + 18;

      // ── Source distribution ─────────────────────────────────────────
      sectionTitle("Répartition des sources");

      const sources = displayData?.sourceDistribution ?? [];
      const totalSrc = sources.reduce((s, d) => s + d.value, 0) || 1;
      const SRC_COLORS: Record<string, [number, number, number]> = {
        google:      [66, 133, 244],
        tripadvisor: [52, 168, 83],
        airbnb:      [255, 56, 92],
        trustpilot:  [0, 182, 122],
        other:       [245, 158, 11],
      };

      sources.slice(0, 5).forEach((s, i) => {
        const bx = M;
        const by = y + i * 9;
        const pct = s.value / totalSrc;
        const barMaxW = W - M * 2 - 40;

        pdf.setTextColor(...GRAY);
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "normal");
        const label = s.name.charAt(0).toUpperCase() + s.name.slice(1);
        pdf.text(label, bx, by + 5);

        pdf.setFillColor(...LIGHT);
        pdf.setDrawColor(...BORDER);
        pdf.roundedRect(bx + 28, by, barMaxW, 6, 1, 1, "FD");
        const col = SRC_COLORS[s.name] ?? AMBER;
        pdf.setFillColor(...col);
        pdf.roundedRect(bx + 28, by, Math.max(barMaxW * pct, 1), 6, 1, 1, "F");

        pdf.setTextColor(...DARK);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${s.value} (${Math.round(pct * 100)}%)`, bx + 28 + barMaxW + 3, by + 5);
      });
      y += Math.max(sources.length, 1) * 9 + 6;

      // ── Top cards table ─────────────────────────────────────────────
      if (y > H - 60) { pdf.addPage(); y = 14; }
      sectionTitle("Tableau de performance des cartes");

      const cols = [
        { label: "Carte",       w: 58 },
        { label: "Scans",       w: 22 },
        { label: "Source",      w: 30 },
        { label: "Performance", w: 30 },
      ];
      let cx = M;

      // Header row
      pdf.setFillColor(...DARK);
      pdf.rect(M, y, W - M * 2, 8, "F");
      cols.forEach(c => {
        pdf.setTextColor(...AMBER);
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "bold");
        pdf.text(c.label, cx + 2, y + 5.5);
        cx += c.w;
      });
      y += 8;

      const topCards = displayData?.topCards ?? [];
      const PERF_LABEL: Record<string, string> = { high: "Élevé", medium: "Moyen", low: "Faible" };
      const PERF_COL: Record<string, [number, number, number]> = {
        high:   [16, 185, 129],
        medium: [245, 158, 11],
        low:    [156, 163, 175],
      };

      topCards.forEach((card, i) => {
        const rowY = y + i * 9;
        if (rowY > H - 20) return; // skip if overflows page

        pdf.setFillColor(i % 2 === 0 ? 255 : 249, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 251);
        pdf.rect(M, rowY, W - M * 2, 9, "F");
        pdf.setDrawColor(...BORDER);
        pdf.line(M, rowY + 9, W - M, rowY + 9);

        cx = M;
        const rowData = [
          card.name.slice(0, 28),
          String(card.scans),
          card.platform.charAt(0).toUpperCase() + card.platform.slice(1),
          PERF_LABEL[card.performance] ?? card.performance,
        ];

        rowData.forEach((val, ci) => {
          if (ci === 3) {
            const pCol = PERF_COL[card.performance] ?? GRAY;
            pdf.setTextColor(...pCol);
            pdf.setFont("helvetica", "bold");
          } else {
            pdf.setTextColor(...DARK);
            pdf.setFont("helvetica", "normal");
          }
          pdf.setFontSize(7.5);
          pdf.text(val, cx + 2, rowY + 6);
          cx += cols[ci].w;
        });
      });

      y += topCards.length * 9 + 6;

      // ── Footer ─────────────────────────────────────────────────────
      const footerY = H - 10;
      pdf.setFillColor(...DARK);
      pdf.rect(0, footerY - 4, W, 14, "F");
      pdf.setTextColor(...AMBER);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("AvisMaker", M, footerY + 2);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "normal");
      pdf.text("contact@avismaker.com  |  avismaker.com", M + 22, footerY + 2);
      pdf.text(`Page 1`, W - M, footerY + 2, { align: "right" });

      // ── Save ─────────────────────────────────────────────────────
      const dateStr = new Date().toISOString().split("T")[0];
      pdf.save(`avismaker-analytics-${dateStr}.pdf`);

    } catch (e) {
      console.error("PDF export error", e);
    } finally {
      setExportLoading(false);
    }
  };

  const kpis = displayData?.kpis;
  const kpiCards = kpis ? [
    {
      label: "Total scans",
      value: kpis.totalScans.toLocaleString(),
      icon: Activity,
      color: "bg-blue-50 text-blue-600",
      trend: null,
    },
    {
      label: "Taux de satisfaction",
      value: `${kpis.conversionRate}%`,
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
      trend: kpis.conversionRate >= 70 ? "up" : kpis.conversionRate >= 50 ? "neutral" : "down",
    },
    {
      label: "Croissance (30j)",
      value: `${kpis.growth > 0 ? "+" : ""}${kpis.growth}%`,
      icon: BarChart2,
      color: kpis.growth >= 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500",
      trend: kpis.growth > 0 ? "up" : kpis.growth < 0 ? "down" : "neutral",
    },
    {
      label: "Activité récente (30j)",
      value: kpis.recentActivity.toLocaleString(),
      icon: Users,
      color: "bg-purple-50 text-purple-600",
      trend: null,
    },
  ] : [];

  return (
    <AuthLayout>
      <div className="max-w-6xl space-y-6 animate-in fade-in duration-300">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1117] flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-primary" />
              Analytics avancées
            </h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Suivez vos performances en temps réel</p>
          </div>
          <div className="flex items-center gap-2">
            {!isBusiness && (
              <Badge className="bg-[#0D1117] text-primary border-0 text-xs px-3 py-1">
                <Lock className="w-3 h-3 mr-1" />
                Business requis
              </Badge>
            )}
            <Button
              onClick={handleExportPDF}
              disabled={exportLoading}
              className={cn(
                "text-sm font-semibold",
                isBusiness
                  ? "bg-[#0D1117] text-primary hover:bg-[#0D1117]/90"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
              title={!isBusiness ? "Disponible avec Business" : undefined}
            >
              {exportLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Génération…</>
              ) : (
                <><FileDown className="w-4 h-4 mr-2" />Exporter en PDF</>
              )}
            </Button>
          </div>
        </div>

        {/* Insight teaser */}
        {!isBusiness && (
          <div className="bg-gradient-to-r from-[#0D1117] to-[#1a2332] rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Vous pourriez générer +32% avec ces insights</p>
                <p className="text-white/50 text-xs">Passez à Business pour accéder aux analyses complètes</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-primary text-[#0D1117] hover:bg-primary/90 font-bold shrink-0"
              onClick={() => navigate("/billing")}
            >
              Passer à Business
            </Button>
          </div>
        )}

        <div ref={reportRef}>
          {/* KPI Cards — always visible as teaser */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-28 bg-[#F9FAFB] border border-border rounded-xl animate-pulse" />
              ))
            ) : kpiCards.map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <Card key={i} className="bg-white border border-border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", kpi.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {kpi.trend === "up" && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                      {kpi.trend === "down" && <ArrowDownRight className="w-4 h-4 text-red-400" />}
                      {kpi.trend === "neutral" && <Minus className="w-4 h-4 text-gray-400" />}
                    </div>
                    <p className="text-2xl font-bold text-[#0D1117]">{kpi.value}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{kpi.label}</p>
                    {!isBusiness && (
                      <p className="text-[10px] text-primary/60 mt-1 font-medium">Aperçu</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Scan timeline — blurred for non-business */}
            <div className="lg:col-span-2">
            <BlurWrapper locked={!isBusiness}>
              <Card className="bg-white border border-border shadow-sm">
                <CardHeader className="pb-2 border-b border-border flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-[#0D1117] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Évolution des scans (30 jours)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={displayData?.scanTimeline ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        tickFormatter={v => v.slice(5)}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
                        formatter={(v: number) => [v, "Scans"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </BlurWrapper>
            </div>

            {/* Source distribution — blurred for non-business */}
            <BlurWrapper locked={!isBusiness}>
              <Card className="bg-white border border-border shadow-sm h-full">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-semibold text-[#0D1117] flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    Répartition des sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={displayData?.sourceDistribution ?? []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        dataKey="value"
                        nameKey="name"
                      >
                        {(displayData?.sourceDistribution ?? []).map((entry, i) => (
                          <Cell
                            key={i}
                            fill={PLATFORM_COLORS[entry.name] ?? "#CBD5E1"}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(v: number, name: string) => [v, name.charAt(0).toUpperCase() + name.slice(1)]}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={v => v.charAt(0).toUpperCase() + v.slice(1)}
                        wrapperStyle={{ fontSize: 11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </BlurWrapper>
          </div>

          {/* Top cards bar chart + table — blurred */}
          <BlurWrapper locked={!isBusiness}>
            <div className="space-y-4">
              {/* Bar chart */}
              <Card className="bg-white border border-border shadow-sm">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-semibold text-[#0D1117] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Top cartes par scans
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={displayData?.topCards ?? []} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#374151" }} width={110} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(v: number) => [v, "Scans"]}
                      />
                      <Bar dataKey="scans" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Data table */}
              <Card className="bg-white border border-border shadow-sm">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-semibold text-[#0D1117] flex items-center gap-2">
                    <Download className="w-4 h-4 text-primary" />
                    Tableau de performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#F9FAFB] border-b border-border">
                          <th className="text-left text-xs font-semibold text-[#6B7280] px-4 py-3">Nom carte</th>
                          <th className="text-left text-xs font-semibold text-[#6B7280] px-4 py-3">Scans</th>
                          <th className="text-left text-xs font-semibold text-[#6B7280] px-4 py-3">Source</th>
                          <th className="text-left text-xs font-semibold text-[#6B7280] px-4 py-3">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(displayData?.topCards ?? []).map((card, i) => (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-[#F9FAFB] transition-colors">
                            <td className="px-4 py-3 font-medium text-[#0D1117] text-sm">{card.name}</td>
                            <td className="px-4 py-3 text-[#374151] font-semibold">{card.scans.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span
                                className="text-xs font-medium px-2 py-1 rounded-full capitalize"
                                style={{
                                  background: (PLATFORM_COLORS[card.platform] ?? "#CBD5E1") + "22",
                                  color: PLATFORM_COLORS[card.platform] ?? "#6B7280",
                                }}
                              >
                                {card.platform}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn("text-xs font-semibold px-2 py-1 rounded-full capitalize", PERFORMANCE_COLOR[card.performance] ?? "text-gray-500 bg-gray-50")}>
                                {card.performance === "high" ? "Élevé" : card.performance === "medium" ? "Moyen" : "Faible"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </BlurWrapper>
        </div>

        {/* Upgrade modal */}
        {showUpgradeModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
            onClick={() => setShowUpgradeModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 flex flex-col items-center gap-4 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-[#0D1117] flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#0D1117]">Export PDF — Business</p>
                <p className="text-sm text-[#6B7280] mt-1">
                  L'export PDF est disponible avec le plan Business. Accédez à tous les rapports et statistiques.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setShowUpgradeModal(false)}>
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-[#0D1117] text-primary hover:bg-[#0D1117]/90 font-semibold"
                  onClick={() => { setShowUpgradeModal(false); navigate("/billing"); }}
                >
                  Passer à Business
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
