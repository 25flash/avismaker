import { AuthLayout } from "@/components/layout/AuthLayout";
import { useGetAdminStats, useListAdminUsers } from "@workspace/api-client-react";
import { Shield, Users, CreditCard, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const planBadgeClass: Record<string, string> = {
  free: "plan-badge-free",
  premium: "plan-badge-premium",
  pro: "plan-badge-pro",
  business: "plan-badge-business",
};

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetAdminStats({
    query: { enabled: user?.role === "admin" },
  });
  const { data: users, isLoading: usersLoading } = useListAdminUsers(
    { limit: 20, offset: 0 },
    { query: { enabled: user?.role === "admin" } }
  );

  const adminStats = stats as unknown as {
    totalUsers: number; totalCards: number; activeCards: number; totalScans: number;
    scansToday: number; totalProfiles: number; planBreakdown: Record<string, number>; revenueMonthly: number;
  } | undefined;

  const userList = (users as unknown as Array<{ id: number; name: string; email: string; plan: string; role: string; createdAt: string; cardCount: number; totalScans: number }>) ?? [];

  if (user?.role !== "admin") {
    return (
      <AuthLayout>
        <div className="text-center py-16">
          <Shield className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-[#0D1117]">{t('admin.accessDenied')}</h2>
          <p className="text-sm text-[#6B7280]">{t('admin.accessDeniedDesc')}</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0D1117] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0D1117]">{t('admin.title')}</h1>
            <p className="text-sm text-[#6B7280]">{t('admin.subtitle')}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { labelKey: "admin.totalUsers", value: adminStats?.totalUsers ?? 0, icon: Users, color: "bg-blue-50 text-blue-600" },
            { labelKey: "admin.totalCards", value: adminStats?.totalCards ?? 0, icon: CreditCard, color: "bg-amber-50 text-amber-600" },
            { labelKey: "admin.totalScans", value: adminStats?.totalScans ?? 0, icon: Activity, color: "bg-green-50 text-green-600" },
            { labelKey: "admin.totalProfiles", value: adminStats?.totalProfiles ?? 0, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
          ].map((stat) => (
            <Card key={stat.labelKey} className="bg-white border border-border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-[#6B7280]">{t(stat.labelKey)}</p>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                {statsLoading ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-[#0D1117]" data-testid={`stat-admin-${stat.labelKey.split('.')[1]}`}>
                    {stat.value.toLocaleString(i18n.language)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Plan breakdown */}
        {adminStats?.planBreakdown && (
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-semibold text-[#0D1117]">{t('admin.planDistribution')}</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid sm:grid-cols-4 gap-4">
                {Object.entries(adminStats.planBreakdown).map(([plan, count]) => (
                  <div key={plan} className="text-center p-4 bg-[#F8FAFC] rounded-xl">
                    <p className="text-2xl font-bold text-[#0D1117] mb-1">{count}</p>
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", planBadgeClass[plan] ?? "plan-badge-free")}>
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users table */}
        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#0D1117]">{t('admin.users')}</CardTitle>
              <Link href="/admin/users">
                <button className="text-xs text-primary hover:underline">{t('admin.viewAll')}</button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {usersLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F3F4F6]">
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">{t('admin.userCol')}</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">{t('admin.planCol')}</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">{t('admin.cardsCol')}</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">{t('admin.roleCol')}</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">{t('admin.joinedCol')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-[#F9FAFB] hover:bg-[#F9FAFB] transition-colors"
                        data-testid={`row-user-${u.id}`}
                      >
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-medium text-[#0D1117]">{u.name}</p>
                            <p className="text-xs text-[#9CA3AF]">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", planBadgeClass[u.plan] ?? "plan-badge-free")}>
                            {u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-[#374151]">{u.cardCount}</td>
                        <td className="px-5 py-3.5">
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded",
                            u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                          )}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#9CA3AF]">
                          {new Date(u.createdAt).toLocaleDateString(i18n.language)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
