import { useState } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useGetAdminStats, useListAdminUsers, useUpdateAdminUser } from "@workspace/api-client-react";
import { Shield, Users, CreditCard, Activity, TrendingUp, Pencil, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const planBadgeClass: Record<string, string> = {
  free: "plan-badge-free",
  premium: "plan-badge-premium",
  pro: "plan-badge-pro",
  business: "plan-badge-business",
};

const PLANS = ["free", "premium", "business"] as const;
const ROLES = ["user", "admin"] as const;

type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  plan: string;
  role: string;
  createdAt: string;
  cardCount: number;
  totalScans: number;
};

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({
    query: { enabled: user?.role === "admin" },
  });
  const { data: users, isLoading: usersLoading } = useListAdminUsers(
    { limit: 20, offset: 0 },
    { query: { enabled: user?.role === "admin" } }
  );
  const { mutateAsync: updateUser } = useUpdateAdminUser();

  const [editUser, setEditUser] = useState<{ id: number; name: string; plan: string; role: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const adminStats = stats as unknown as {
    totalUsers: number; totalCards: number; activeCards: number; totalScans: number;
    scansToday: number; totalProfiles: number; planBreakdown: Record<string, number>; revenueMonthly: number;
  } | undefined;

  const userList = (users as unknown as AdminUserRow[]) ?? [];

  const handleEdit = (u: AdminUserRow) => {
    setEditUser({ id: u.id, name: u.name, plan: u.plan, role: u.role });
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await updateUser({ id: editUser.id, data: { plan: editUser.plan, role: editUser.role } });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: t("admin.updateSuccess"), description: t("admin.updateSuccessDesc") });
      setEditUser(null);
    } catch {
      toast({ variant: "destructive", title: t("admin.updateFailed") });
    } finally {
      setSaving(false);
    }
  };

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
                      <th className="px-5 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">{t('admin.actionsCol')}</th>
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
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-[#9CA3AF] hover:text-[#0D1117]"
                            onClick={() => handleEdit(u)}
                            data-testid={`btn-edit-user-${u.id}`}
                            title={t("common.edit")}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
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

      {/* Edit user dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">{t("admin.editUser")}</DialogTitle>
            <DialogDescription className="text-sm text-[#6B7280]">
              {editUser?.name} — {t("admin.editDesc")}
            </DialogDescription>
          </DialogHeader>

          {editUser && (
            <div className="space-y-4 py-2">
              {/* Plan selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#374151]">{t("admin.planCol")}</label>
                <Select
                  value={editUser.plan}
                  onValueChange={(v) => setEditUser({ ...editUser, plan: v })}
                >
                  <SelectTrigger className="w-full" data-testid="select-edit-plan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANS.map((p) => (
                      <SelectItem key={p} value={p}>
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full mr-2", planBadgeClass[p])}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#374151]">{t("admin.roleCol")}</label>
                <Select
                  value={editUser.role}
                  onValueChange={(v) => setEditUser({ ...editUser, role: v })}
                >
                  <SelectTrigger className="w-full" data-testid="select-edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded",
                          r === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                        )}>
                          {r}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditUser(null)} disabled={saving}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
              data-testid="btn-save-user-edit"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("common.loading")}</>
                : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
