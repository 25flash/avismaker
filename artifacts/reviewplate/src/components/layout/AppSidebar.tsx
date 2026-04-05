import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, CreditCard, Building2, Bot, Receipt, MessageCircle,
  Shield, LogOut, Star, ChevronRight, X
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const planBadgeClass: Record<string, string> = {
  free: "plan-badge-free",
  premium: "plan-badge-premium",
  pro: "plan-badge-pro",
  business: "plan-badge-business",
};

interface AppSidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard, testId: "nav-dashboard" },
    { href: "/cards", label: t("nav.cards"), icon: CreditCard, testId: "nav-cards" },
    { href: "/profiles", label: t("nav.profiles"), icon: Building2, testId: "nav-business-profiles" },
    { href: "/ai-reply", label: t("nav.aiReply"), icon: Bot, testId: "nav-ai-reply" },
    { href: "/billing", label: t("nav.billing"), icon: Receipt, testId: "nav-billing" },
    { href: "/support", label: t("nav.support"), icon: MessageCircle, testId: "nav-support" },
  ];

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full w-64 bg-[#0D1117] text-white border-r border-white/10">
      {/* Logo + close button */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <Star className="w-5 h-5 text-[#0D1117]" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold text-white tracking-tight flex-1">AvisMakers</span>
        {/* Close button — only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="md:hidden text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={item.testId}
              onClick={handleNavClick}
            >
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer group",
                  isActive
                    ? "bg-primary text-[#0D1117]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
              </div>
            </Link>
          );
        })}

        {/* Admin link */}
        {user?.role === "admin" && (
          <Link href="/admin" data-testid="nav-admin" onClick={handleNavClick}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer mt-4",
                location.startsWith("/admin")
                  ? "bg-primary text-[#0D1117]"
                  : "text-amber-400/70 hover:text-amber-400 hover:bg-white/10"
              )}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>{t("nav.admin")}</span>
            </div>
          </Link>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-[#0D1117]">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate" data-testid="text-username">{user?.name}</p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
              planBadgeClass[user?.plan ?? "free"] ?? "plan-badge-free"
            )}
            data-testid="text-plan-badge"
          >
            {user?.plan?.charAt(0).toUpperCase() + (user?.plan?.slice(1) ?? "")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => { logout(); handleNavClick(); }}
            data-testid="button-logout"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("nav.logout")}</span>
          </button>
          <LanguageSwitcher variant="dark" />
        </div>
      </div>
    </div>
  );
}
