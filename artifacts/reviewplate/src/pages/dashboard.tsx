import { AuthLayout } from "@/components/layout/AuthLayout";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { CreditCard, Activity, TrendingUp, Building2, Star, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardSummary();
  const { user } = useAuth();

  const summary = data as unknown as {
    totalCards: number;
    activeCards: number;
    totalScans: number;
    scansThisMonth: number;
    totalProfiles: number;
    recentScans: Array<{ id: number; cardId: number; cardCode: string; timestamp: string; country: string | null; deviceType: string | null; wasNegative: boolean }>;
    topCards: Array<{ id: number; code: string; status: string; platform: string | null; scanCount: number; smartReviewEnabled: boolean }>;
  } | undefined;

  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1117]">Dashboard</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Welcome back, {user?.name}</p>
          </div>
          <Link href="/activate">
            <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90" data-testid="button-activate-card">
              <Zap className="w-4 h-4 mr-2" />
              Activate Card
            </Button>
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Cards" value={summary?.totalCards ?? 0} icon={CreditCard} loading={isLoading} />
          <StatCard title="Active Cards" value={summary?.activeCards ?? 0} icon={Activity} subtitle="Ready to scan" loading={isLoading} />
          <StatCard title="Total Scans" value={summary?.totalScans ?? 0} icon={TrendingUp} loading={isLoading} />
          <StatCard title="This Month" value={summary?.scansThisMonth ?? 0} icon={Star} subtitle="Scans this month" loading={isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top performing cards */}
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-[#0D1117]">Top Cards</CardTitle>
                <Link href="/cards">
                  <button className="text-xs text-primary hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
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
                  <p className="text-sm text-[#6B7280]">No cards yet. Activate your first card.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {summary?.topCards?.map((card) => (
                    <Link key={card.id} href={`/cards/${card.id}`}>
                      <div
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                        data-testid={`card-top-${card.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-mono font-bold text-primary">{card.code.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0D1117]">{card.code}</p>
                            {card.platform && (
                              <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", platformColors[card.platform] ?? "bg-gray-100 text-gray-700")}>
                                {card.platform}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#0D1117]">{card.scanCount}</p>
                          <p className="text-xs text-[#6B7280]">scans</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent scans */}
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold text-[#0D1117]">Recent Scans</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : summary?.recentScans?.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-10 h-10 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-sm text-[#6B7280]">No scans yet. Share your card to get started.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {summary?.recentScans?.slice(0, 8).map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between py-2.5 border-b border-[#F3F4F6] last:border-0"
                      data-testid={`row-scan-${scan.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", scan.wasNegative ? "bg-red-400" : "bg-[#10B981]")} />
                        <div>
                          <p className="text-sm font-medium text-[#374151]">{scan.cardCode}</p>
                          <p className="text-xs text-[#6B7280]">{scan.country ?? "Unknown"} · {scan.deviceType ?? "Unknown"}</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        {new Date(scan.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#0D1117]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: "/activate", label: "Activate Card", icon: Zap, color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
                { href: "/profiles", label: "Add Business", icon: Building2, color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
                { href: "/ai-reply", label: "AI Reply", icon: Star, color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
                { href: "/billing", label: "Upgrade Plan", icon: TrendingUp, color: "bg-green-50 text-green-700 hover:bg-green-100" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <button
                    className={cn("w-full flex flex-col items-center gap-2 p-4 rounded-xl transition-colors text-sm font-medium", action.color)}
                    data-testid={`button-quick-${action.label.toLowerCase().replace(/\s/g, "-")}`}
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
