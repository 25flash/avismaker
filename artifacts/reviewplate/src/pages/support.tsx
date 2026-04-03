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

export default function SupportPage() {
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
          toast({ variant: "destructive", title: "Error", description: "Failed to send message. Please try again." });
        },
      }
    );
  };

  return (
    <AuthLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1117]">Support</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Get help from our team</p>
        </div>

        {sent ? (
          <Card className="bg-white border border-border">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#10B981]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0D1117] mb-2">Message sent!</h3>
              <p className="text-sm text-[#6B7280] mb-6 max-w-xs mx-auto">
                We've received your message and will get back to you within 24 hours.
              </p>
              <Button
                variant="outline"
                onClick={() => { setSent(false); setForm({ subject: "", category: "general", message: "" }); }}
                data-testid="button-send-another"
              >
                Send another message
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-white border border-border shadow-sm">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold text-[#0D1117] flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Question</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="card">Card Issue</SelectItem>
                      <SelectItem value="account">Account & Profile</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    data-testid="input-subject"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Message</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Please describe your issue in detail..."
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
                  {createMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border">
                <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#0D1117]">Email Support</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">support@reviewplate.com</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Response within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#0D1117]">Knowledge Base</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">Browse FAQs and guides</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Available 24/7</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
