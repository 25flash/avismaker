import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function SignupPage() {
  const { t } = useTranslation();
  const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email(t("auth.validEmail")),
    password: z.string().min(8, t("auth.passwordRequirements")),
    confirmPassword: z.string(),
  }).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
  type FormData = z.infer<typeof schema>;
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (data: FormData) => {
    registerMutation.mutate(
      { data: { name: data.name, email: data.email, password: data.password } },
      {
        onSuccess: (result) => {
          const authResult = result as unknown as { user: { id: number; email: string; name: string; role: string; plan: string; language: string; createdAt: string }; token: string };
          setAuth(authResult.user, authResult.token);
          setLocation("/dashboard");
        },
        onError: (err: unknown) => {
          const apiError = err as { data?: { error?: string } };
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: apiError?.data?.error ?? "Something went wrong",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0D1117] p-12">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="/logo.png" alt="AvisMaker" className="w-9 h-9 object-contain shrink-0" />
            <span className="text-xl font-bold text-white">AvisMaker</span>
          </div>
        </Link>
        <div className="space-y-6">
          {[
            { icon: "01", title: "Activate your card", desc: "Enter your unique NFC/QR code to claim your card" },
            { icon: "02", title: "Connect your review platform", desc: "Link Google, Airbnb, TripAdvisor, or Trustpilot" },
            { icon: "03", title: "Start collecting reviews", desc: "Customers tap/scan and leave reviews instantly" },
          ].map((step) => (
            <div key={step.icon} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{step.icon}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{step.title}</p>
                <p className="text-white/50 text-xs mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-white/40 text-sm">No credit card required for the free plan.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="AvisMaker" className="w-8 h-8 object-contain shrink-0" />
            <span className="text-lg font-bold text-[#0D1117]">AvisMaker</span>
          </div>

          <h1 className="text-2xl font-bold text-[#0D1117] mb-2">{t("auth.createAccount")}</h1>
          <p className="text-sm text-[#6B7280] mb-8">{t("auth.createAccountDesc")}</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Smith" data-testid="input-name" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="you@example.com" data-testid="input-email" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="••••••••" data-testid="input-password" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="••••••••" data-testid="input-confirm-password" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button
                type="submit"
                data-testid="button-submit"
                disabled={registerMutation.isPending}
                className="w-full h-11 bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
              >
                {registerMutation.isPending ? t("auth.creatingAccount") : t("auth.createAccount")}
              </Button>
            </form>
          </Form>

          <p className="text-sm text-center text-[#6B7280] mt-6">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              {t("auth.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
