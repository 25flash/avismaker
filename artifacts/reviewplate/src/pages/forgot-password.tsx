import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@workspace/api-client-react";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const forgotMutation = useForgotPassword();

  const schema = z.object({
    email: z.string().email(t("auth.validEmail")),
  });
  type FormData = z.infer<typeof schema>;

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
          <img src="/logo.png" alt="AvisMaker" className="w-9 h-9 object-contain shrink-0" />
          <span className="text-lg font-bold text-[#0D1117]">AvisMaker</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#10B981]" />
            </div>
            <h1 className="text-xl font-bold text-[#0D1117] mb-2">{t("auth.checkEmailTitle")}</h1>
            <p className="text-[#6B7280] text-sm mb-6">{t("auth.checkEmailDesc")}</p>
            <Link href="/login">
              <Button variant="outline" className="w-full">{t("auth.backToLogin")}</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#0D1117] mb-2">{t("auth.resetYourPassword")}</h1>
            <p className="text-sm text-[#6B7280] mb-8">{t("auth.resetPasswordDesc")}</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.email")}</FormLabel>
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
                  {forgotMutation.isPending ? t("auth.sendingReset") : t("auth.sendResetLink")}
                </Button>
              </form>
            </Form>

            <Link href="/login" className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#374151] mt-6 justify-center">
              <ArrowLeft className="w-4 h-4" />
              {t("auth.backToLogin")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
