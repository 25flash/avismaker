import { AuthLayout } from "@/components/layout/AuthLayout";
import { useCreateSupportMessage } from "@workspace/api-client-react";
import { MessageCircle, Send, CheckCircle, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function SupportPage() {
  const { t } = useTranslation();
  const createMutation = useCreateSupportMessage();
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "general", message: "" });

  const handleSubmit = () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    createMutation.mutate(
      { data: { subject: form.subject, category: form.category, message: form.message } },
      {
        onSuccess: () => {
          setSent(true);
        },
        onError: () => {
          toast({ variant: "destructive", title: t('common.error'), description: t('support.sendError') });
        },
      }
    );
  };

  return (
    <AuthLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1117]">{t('support.title')}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{t('support.getHelp')}</p>
        </div>

        {sent ? (
          <Card className="bg-white border border-border">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#10B981]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0D1117] mb-2">{t('support.messageSent')}</h3>
              <p className="text-sm text-[#6B7280] mb-6 max-w-xs mx-auto">
                {t('support.messageSentDesc')}
              </p>
              <Button
                variant="outline"
                onClick={() => { setSent(false); setForm({ subject: "", category: "general", message: "" }); }}
                data-testid="button-send-another"
              >
                {t('support.sendAnother')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-white border border-border shadow-sm">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold text-[#0D1117] flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  {t('support.contactSupport')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>{t('support.category')}</Label>
                  <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{t('support.categories.general')}</SelectItem>
                      <SelectItem value="billing">{t('support.categories.billing')}</SelectItem>
                      <SelectItem value="technical">{t('support.categories.technical')}</SelectItem>
                      <SelectItem value="card">{t('support.categories.card')}</SelectItem>
                      <SelectItem value="account">{t('support.categories.account')}</SelectItem>
                      <SelectItem value="feature">{t('support.categories.feature')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>{t('support.subject')}</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder={t('support.subjectPlaceholder')}
                    data-testid="input-subject"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t('support.message')}</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder={t('support.messagePlaceholder')}
                    rows={6}
                    data-testid="input-message"
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!form.subject.trim() || !form.message.trim() || createMutation.isPending}
                  className="w-full bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
                  data-testid="button-submit"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? t('support.sending') : t('support.send')}
                </Button>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border">
                <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#0D1117]">{t('support.emailSupport')}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">contact@avismaker.com</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{t('support.responseTime')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#0D1117]">{t('support.knowledgeBase')}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{t('support.knowledgeBaseDesc')}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{t('support.available247')}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
