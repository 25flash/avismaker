import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { initializeApiAuth } from "@/lib/api-setup";

// Lazy-loaded routes — each page is loaded only when visited
const LandingPage = lazy(() => import("@/pages/landing"));
const LoginPage = lazy(() => import("@/pages/login"));
const SignupPage = lazy(() => import("@/pages/signup"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));

const DashboardPage = lazy(() => import("@/pages/dashboard"));
const CardsPage = lazy(() => import("@/pages/cards/index"));
const CardEditorPage = lazy(() => import("@/pages/cards/[id]"));
const ProfilesPage = lazy(() => import("@/pages/profiles/index"));
const ProfileEditorPage = lazy(() => import("@/pages/profiles/[id]"));
const AiReplyPage = lazy(() => import("@/pages/ai-reply"));
const BillingPage = lazy(() => import("@/pages/billing"));
const SupportPage = lazy(() => import("@/pages/support"));
const ActivatePage = lazy(() => import("@/pages/activate"));

const AccountPage = lazy(() => import("@/pages/account"));
const AdminPage = lazy(() => import("@/pages/admin/index"));
const CardAnalyticsPage = lazy(() => import("@/pages/analytics/cards/[id]"));
const ScanPage = lazy(() => import("@/pages/scan"));
const NotFound = lazy(() => import("@/pages/not-found"));

initializeApiAuth();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public */}
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />

        {/* Public scan page */}
        <Route path="/c/:code" component={ScanPage} />

        {/* Authenticated app */}
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/activate" component={ActivatePage} />
        <Route path="/cards" component={CardsPage} />
        <Route path="/cards/:id" component={CardEditorPage} />
        <Route path="/profiles" component={ProfilesPage} />
        <Route path="/profiles/:id" component={ProfileEditorPage} />
        <Route path="/ai-reply" component={AiReplyPage} />
        <Route path="/billing" component={BillingPage} />
        <Route path="/support" component={SupportPage} />
        <Route path="/account" component={AccountPage} />

        {/* Analytics */}
        <Route path="/analytics/cards/:id" component={CardAnalyticsPage} />

        {/* Admin */}
        <Route path="/admin" component={AdminPage} />

        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
