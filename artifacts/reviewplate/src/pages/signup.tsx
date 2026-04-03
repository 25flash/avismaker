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

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
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
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-[#0D1117]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">ReviewPlate</span>
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
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-[#0D1117]" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-[#0D1117]">ReviewPlate</span>
          </div>

          <h1 className="text-2xl font-bold text-[#0D1117] mb-2">Create your account</h1>
          <p className="text-sm text-[#6B7280] mb-8">Start collecting reviews in minutes — free</p>

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
                {registerMutation.isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <p className="text-sm text-center text-[#6B7280] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
