import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Menu } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageKey, setPageKey] = useState(location);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setPageKey(location);
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-[#6B7280] animate-pulse">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <div
        className={[
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:z-auto md:flex-shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <AppSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#0D1117] border-b border-white/10 md:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="text-white/80 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[#0D1117]">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-white font-bold text-base tracking-tight">AvisMakers</span>
          </div>
        </div>

        {/* Page content with fade-in transition */}
        <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth">
          <div
            key={pageKey}
            className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-page-in"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
