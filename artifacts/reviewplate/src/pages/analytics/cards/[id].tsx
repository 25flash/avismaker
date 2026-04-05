import { AuthLayout } from "@/components/layout/AuthLayout";
import { useParams, Link } from "wouter";
import { ArrowLeft, Activity, BarChart2, TrendingUp, AlertTriangle, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface CardStats {
  cardId: number;
  totalScans: number;
  scansThisMonth: number;
  scansThisWeek: number;
  averageRating: number | null;
  negativeCount: number;
  scansByDay: Array<{ date: string; count: number }>;
  scansByCountry: Array<{ country: string; count: number }>;
}

export default function CardAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const cardId = params.id;
  const { token } = useAuth();
  const [stats, setStats] = useState<CardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!cardId) return;
    const t = token ?? localStorage.getItem("reviewplate_token");
    setLoading(true);
    fetch(`/api/analytics/cards/${cardId}/stats`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [cardId, token]);

  return (
    <AuthLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link href={`/cards/${cardId}`}>
            <button className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0D1117] flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-primary" />
              Card Analytics
            </h1>
            <p className="text-sm text-[#6B7280]">Performance stats for card #{cardId}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : error ? (
          <Card className="bg-white border border-border">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">Failed to load analytics. Make sure this card belongs to you.</p>
              <Link href="/cards">
                <Button className="mt-4" variant="outline">Back to cards</Button>
              </Link>
            </CardContent>
          </Card>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Scans", value: stats.totalScans, icon: Activity, color: "bg-blue-50 text-blue-600" },
                { label: "This Month", value: stats.scansThisMonth, icon: TrendingUp, color: "bg-green-50 text-green-600" },
                { label: "This Week", value: stats.scansThisWeek, icon: BarChart2, color: "bg-amber-50 text-amber-600" },
                { label: "Negative", value: stats.negativeCount, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
              ].map((stat) => (
                <Card key={stat.label} className="bg-white border border-border shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-[#6B7280]">{stat.label}</p>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#0D1117]">{stat.value.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {stats.averageRating !== null && (
              <Card className="bg-white border border-border shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Star className="w-7 h-7 text-primary" fill="#F59E0B" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#0D1117]">{stats.averageRating.toFixed(1)}</p>
                    <p className="text-sm text-[#6B7280]">Average rating from smart review flow</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.scansByDay.length > 0 && (
              <Card className="bg-white border border-border shadow-sm">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base font-semibold text-[#0D1117]">Scans by Day</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-2">
                    {stats.scansByDay.slice(-10).map((d) => (
                      <div key={d.date} className="flex items-center gap-3">
                        <span className="text-xs text-[#6B7280] w-24 shrink-0">{d.date}</span>
                        <div className="flex-1 bg-[#F3F4F6] rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${Math.min(100, (d.count / Math.max(...stats.scansByDay.map(x => x.count))) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#374151] w-6 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.scansByCountry.length > 0 && (
              <Card className="bg-white border border-border shadow-sm">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base font-semibold text-[#0D1117]">Scans by Location</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-2">
                    {stats.scansByCountry.slice(0, 8).map((c) => (
                      <div key={c.country} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-[#374151]">{c.country}</span>
                        <span className="text-sm font-semibold text-[#0D1117]">{c.count} scans</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.totalScans === 0 && (
              <Card className="bg-white border border-border">
                <CardContent className="py-12 text-center">
                  <Activity className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#374151]">No scans yet</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Share your card link to start collecting scans.</p>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </AuthLayout>
  );
}
