import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle, Mail, Clock, CheckCircle2, Send, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

interface SupportMsg {
  id: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  subject: string;
  category: string;
  messageText: string;
  sentDate: string;
  isRead: boolean;
  repliedByAdmin: string | null;
  replyDate: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "Général",
  billing: "Facturation",
  technical: "Technique",
  card: "Carte",
  account: "Compte",
  feature: "Fonctionnalité",
};

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-gray-100 text-gray-700",
  billing: "bg-amber-50 text-amber-700",
  technical: "bg-blue-50 text-blue-700",
  card: "bg-purple-50 text-purple-700",
  account: "bg-green-50 text-green-700",
  feature: "bg-pink-50 text-pink-700",
};

export default function AdminMessagesPage() {
  const { user, token } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<SupportMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [sending, setSending] = useState<number | null>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) { navigate("/dashboard"); return; }
    const tk = token ?? localStorage.getItem("reviewplate_token");
    if (!tk) return;
    fetch(`${API_BASE}/api/admin/support-messages`, {
      headers: { Authorization: `Bearer ${tk}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setMessages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isAdmin, token]);

  const handleReply = async (id: number) => {
    const reply = (replies[id] ?? "").trim();
    if (!reply) return;
    const tk = token ?? localStorage.getItem("reviewplate_token");
    setSending(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/support-messages/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tk}` },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) throw new Error();
      const updated: SupportMsg = await res.json();
      setMessages(msgs => msgs.map(m => m.id === id ? { ...m, ...updated } : m));
      setReplies(r => ({ ...r, [id]: "" }));
      toast({ title: "Réponse envoyée", description: "Le message a été marqué comme traité." });
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer la réponse." });
    } finally {
      setSending(null);
    }
  };

  const unread = messages.filter(m => !m.isRead).length;

  if (!isAdmin) return null;

  return (
    <AuthLayout>
      <div className="space-y-5 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1117] flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              Messages Support
            </h1>
            <p className="text-sm text-[#6B7280] mt-0.5">
              Messages reçus depuis la page Support
            </p>
          </div>
          {unread > 0 && (
            <Badge className="bg-red-500 text-white border-0 text-xs px-3 py-1">
              {unread} non lu{unread > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Messages list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-[#F9FAFB] border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <Card className="bg-white border border-border">
            <CardContent className="py-16 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-[#9CA3AF]" />
              </div>
              <p className="text-sm font-medium text-[#6B7280]">Aucun message pour l'instant</p>
              <p className="text-xs text-[#9CA3AF] mt-1">Les messages du Support apparaîtront ici</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => {
              const isOpen = expanded === msg.id;
              const catLabel = CATEGORY_LABELS[msg.category] ?? msg.category;
              const catColor = CATEGORY_COLORS[msg.category] ?? "bg-gray-100 text-gray-700";
              const date = new Date(msg.sentDate).toLocaleDateString("fr-FR", {
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
              });
              return (
                <Card
                  key={msg.id}
                  className={cn(
                    "bg-white border shadow-sm overflow-hidden transition-all",
                    !msg.isRead ? "border-primary/40 shadow-amber-50" : "border-border"
                  )}
                >
                  {/* Row summary */}
                  <button
                    className="w-full text-left px-5 py-4"
                    onClick={() => setExpanded(isOpen ? null : msg.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[#0D1117]">
                          {msg.senderName[0]?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[#0D1117] truncate">{msg.senderName}</span>
                          <span className="text-xs text-[#9CA3AF]">{msg.senderEmail}</span>
                          {!msg.isRead && (
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-[#374151] font-medium mt-0.5 truncate">
                          {msg.subject || "(Sans objet)"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", catColor)}>
                            {catLabel}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                            <Clock className="w-3 h-3" />
                            {date}
                          </span>
                          {msg.repliedByAdmin && (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Traité
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-[#9CA3AF]">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="border-t border-border px-5 py-4 space-y-4">
                      {/* Message body */}
                      <div>
                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Message</p>
                        <div className="bg-[#F9FAFB] rounded-lg p-3 text-sm text-[#374151] whitespace-pre-wrap leading-relaxed">
                          {msg.messageText}
                        </div>
                      </div>

                      {/* Contact info */}
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                        <Mail className="w-3.5 h-3.5" />
                        <a href={`mailto:${msg.senderEmail}`} className="hover:text-primary underline underline-offset-2">
                          {msg.senderEmail}
                        </a>
                      </div>

                      {/* Previous reply */}
                      {msg.repliedByAdmin && (
                        <div>
                          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                            Réponse envoyée
                            {msg.replyDate && (
                              <span className="font-normal text-[#9CA3AF] ml-2">
                                {new Date(msg.replyDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                              </span>
                            )}
                          </p>
                          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-sm text-emerald-800 whitespace-pre-wrap leading-relaxed">
                            {msg.repliedByAdmin}
                          </div>
                        </div>
                      )}

                      {/* Reply form */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                          {msg.repliedByAdmin ? "Nouvelle réponse" : "Répondre"}
                        </p>
                        <Textarea
                          rows={3}
                          className="resize-none text-sm"
                          placeholder="Écrire votre réponse…"
                          value={replies[msg.id] ?? ""}
                          onChange={e => setReplies(r => ({ ...r, [msg.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          className="bg-[#0D1117] text-primary hover:bg-[#0D1117]/90 font-semibold"
                          disabled={!(replies[msg.id] ?? "").trim() || sending === msg.id}
                          onClick={() => handleReply(msg.id)}
                        >
                          {sending === msg.id ? (
                            <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Envoi…</>
                          ) : (
                            <><Send className="w-3.5 h-3.5 mr-2" />Envoyer la réponse</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
