import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { initializeApiAuth } from "@/lib/api-setup";

import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import ForgotPasswordPage from "@/pages/forgot-password";

import DashboardPage from "@/pages/dashboard";
import CardsPage from "@/pages/cards/index";
import CardEditorPage from "@/pages/cards/[id]";
import ProfilesPage from "@/pages/profiles/index";
import ProfileEditorPage from "@/pages/profiles/[id]";
import AiReplyPage from "@/pages/ai-reply";
import BillingPage from "@/pages/billing";
import SupportPage from "@/pages/support";
import ActivatePage from "@/pages/activate";

import AdminPage from "@/pages/admin/index";
import ScanPage from "@/pages/scan";
import NotFound from "@/pages/not-found";

initializeApiAuth();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
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

      {/* Admin */}
      <Route path="/admin" component={AdminPage} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
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
