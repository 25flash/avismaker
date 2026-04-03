import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@workspace/api-client-react";

const schema = z.object({
  email: z.string().email("Valid email required"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const forgotMutation = useForgotPassword();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: FormData) => {
    forgotMutation.mutate(
      { data: { email: data.email } },
      { onSuccess: () => setSent(true) }
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Star className="w-4 h-4 text-[#0D1117]" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-[#0D1117]">ReviewPlate</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#10B981]" />
            </div>
            <h1 className="text-xl font-bold text-[#0D1117] mb-2">Check your email</h1>
            <p className="text-[#6B7280] text-sm mb-6">
              If an account with that email exists, we sent a password reset link.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">Back to login</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#0D1117] mb-2">Reset your password</h1>
            <p className="text-sm text-[#6B7280] mb-8">
              Enter your email and we'll send you a link to reset your password.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="you@example.com" data-testid="input-email" className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  data-testid="button-submit"
                  disabled={forgotMutation.isPending}
                  className="w-full h-11 bg-primary text-[#0D1117] font-semibold"
                >
                  {forgotMutation.isPending ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            </Form>

            <Link href="/login" className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#374151] mt-6 justify-center">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
