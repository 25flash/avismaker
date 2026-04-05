import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, CreditCard, Building2, Bot, Receipt, MessageCircle,
  Shield, LogOut, Star, X, Settings
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
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
        <img src="/logo.png" alt="AvisMakers" className="w-8 h-8 object-contain shrink-0" />
        <span className="text-lg font-bold text-white tracking-tight flex-1">AvisMakers</span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={item.testId}
              onClick={handleNavClick}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer group relative",
                  "transition-colors duration-150",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-white/65 hover:text-white hover:bg-white/8"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                )}
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-white/50 group-hover:text-white/80")} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Admin link */}
        {user?.role === "admin" && (
          <>
            <div className="my-2 border-t border-white/10" />
            <Link href="/admin" data-testid="nav-admin" onClick={handleNavClick}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer relative",
                  "transition-colors duration-150",
                  location.startsWith("/admin")
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-amber-400/60 hover:text-amber-400 hover:bg-white/8"
                )}
              >
                {location.startsWith("/admin") && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-r-full" />
                )}
                <Shield className="w-4 h-4 shrink-0" />
                <span>{t("nav.admin")}</span>
              </div>
            </Link>
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 px-4 py-4">
        <Link href="/account" onClick={handleNavClick}>
          <div className={cn(
            "flex items-center gap-3 mb-3 min-w-0 rounded-lg px-2 py-1.5 -mx-2 cursor-pointer transition-colors",
            location === "/account" ? "bg-white/10" : "hover:bg-white/8"
          )}>
            <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden border border-white/20">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-[#0D1117]">
                    {user?.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate" data-testid="text-username">{user?.name}</p>
              <p className="text-xs text-white/45 truncate">{user?.email}</p>
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
        </Link>
        <div className="flex items-center justify-between">
          <button
            onClick={() => { logout(); handleNavClick(); }}
            data-testid="button-logout"
            aria-label={t("nav.logout")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/55 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t("nav.logout")}</span>
          </button>
          <div className="flex items-center gap-1">
            <Link href="/account" onClick={handleNavClick}>
              <button
                aria-label={t("nav.account")}
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                  location === "/account" ? "text-primary bg-primary/15" : "text-white/45 hover:text-white hover:bg-white/10"
                )}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </Link>
            <LanguageSwitcher variant="dark" />
          </div>
        </div>
      </div>
    </div>
  );
}
