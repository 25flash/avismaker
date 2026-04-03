import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, CreditCard, Building2, Bot, Receipt, MessageCircle,
  Shield, LogOut, Star, Settings, ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/profiles", label: "Business Profiles", icon: Building2 },
  { href: "/ai-reply", label: "AI Reply", icon: Bot },
  { href: "/billing", label: "Billing", icon: Receipt },
  { href: "/support", label: "Support", icon: MessageCircle },
];

const planBadgeClass: Record<string, string> = {
  free: "plan-badge-free",
  premium: "plan-badge-premium",
  pro: "plan-badge-pro",
  business: "plan-badge-business",
};

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full w-64 bg-[#0D1117] text-white border-r border-white/10">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Star className="w-5 h-5 text-[#0D1117]" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">ReviewPlate</span>
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
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
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
          <Link href="/admin" data-testid="nav-admin">
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer mt-4",
                location.startsWith("/admin")
                  ? "bg-primary text-[#0D1117]"
                  : "text-amber-400/70 hover:text-amber-400 hover:bg-white/10"
              )}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Admin Panel</span>
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
        <button
          onClick={logout}
          data-testid="button-logout"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}
