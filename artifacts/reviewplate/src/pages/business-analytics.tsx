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
  const reportRef = useRef<HTMLDivElement>(null);

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
    if (!reportRef.current) return;
    setExportLoading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const canvas = await html2canvas(reportRef.current, { scale: 1.5, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.setFillColor(13, 17, 23);
      pdf.rect(0, 0, pdfWidth, 18, "F");
      pdf.setTextColor(245, 158, 11);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("AvisMaker — Analytics avancées", 10, 12);
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, pdfWidth - 10, 12, { align: "right" });

      const pageHeight = pdf.internal.pageSize.getHeight() - 22;
      let yOffset = 20;
      let imgOffset = 0;
      const imgHeightPerPage = (pageHeight / pdfHeight) * canvas.height;

      while (imgOffset < canvas.height) {
        if (imgOffset > 0) { pdf.addPage(); yOffset = 10; }
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(imgHeightPerPage, canvas.height - imgOffset);
        const sliceCtx = sliceCanvas.getContext("2d");
        if (sliceCtx) {
          sliceCtx.drawImage(canvas, 0, imgOffset, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
        }
        const sliceData = sliceCanvas.toDataURL("image/png");
        const sliceHeight = (sliceCanvas.height * pdfWidth) / canvas.width;
        pdf.addImage(sliceData, "PNG", 0, yOffset, pdfWidth, sliceHeight);
        imgOffset += imgHeightPerPage;
      }

      pdf.save(`avismaker-analytics-${new Date().toISOString().split("T")[0]}.pdf`);
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
