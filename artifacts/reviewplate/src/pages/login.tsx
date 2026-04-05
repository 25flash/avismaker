import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(
      { data: { email: data.email, password: data.password } },
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
            title: "Login failed",
            description: apiError?.data?.error ?? "Invalid credentials",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0D1117] p-12">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-[#0D1117]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">AvisMakers</span>
          </div>
        </Link>
        <div>
          <blockquote className="text-2xl font-semibold text-white leading-relaxed mb-4">
            "More 5-star reviews, zero friction."
          </blockquote>
          <p className="text-white/60 text-base">
            Join thousands of businesses turning every customer interaction into a review opportunity.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {["J", "M", "S"].map((l, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-[#0D1117] text-xs font-bold text-[#0D1117]">
                {l}
              </div>
            ))}
          </div>
          <p className="text-white/60 text-sm">Trusted by 2,400+ businesses</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-[#0D1117]" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-[#0D1117]">AvisMakers</span>
          </div>

          <h1 className="text-2xl font-bold text-[#0D1117] mb-2">Welcome back</h1>
          <p className="text-sm text-[#6B7280] mb-8">Sign in to your account to continue</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#374151]">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@example.com"
                        data-testid="input-email"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-[#374151]">Password</FormLabel>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          data-testid="input-password"
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#374151]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                data-testid="button-submit"
                disabled={loginMutation.isPending}
                className="w-full h-11 bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <p className="text-sm text-center text-[#6B7280] mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
