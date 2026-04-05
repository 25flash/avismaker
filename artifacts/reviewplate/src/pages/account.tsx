import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Camera, User, Trash2, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export default function AccountPage() {
  const { t } = useTranslation();
  const { user, token, setAuth } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarData, setAvatarData] = useState<string | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t("account.avatarTooBig"), description: t("account.avatarTooBigDesc"), variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarPreview(result);
      setAvatarData(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const body: Record<string, string | null> = { name };
      if (avatarData !== undefined) body.avatarUrl = avatarData;

      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setAuth(updated, token);
      setAvatarData(undefined);
      toast({ title: t("account.saved"), description: t("account.savedDesc") });
    } catch {
      toast({ title: t("account.saveFailed"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const isDirty = name !== user?.name || avatarData !== undefined;

  return (
    <AuthLayout>
      <div className="space-y-6 max-w-xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#0D1117]">{t("account.title")}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{t("account.subtitle")}</p>
        </div>

        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold text-[#0D1117]">{t("account.identity")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-6">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {/* Avatar preview */}
              <div className="relative shrink-0">
                <div className={cn(
                  "w-24 h-24 rounded-2xl overflow-hidden border-2 border-border shadow-sm",
                  !avatarPreview && "bg-primary/10 flex items-center justify-center"
                )}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-primary/50" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-primary/90 transition-colors"
                  title={t("account.changeAvatar")}
                >
                  <Camera className="w-3.5 h-3.5 text-[#0D1117]" />
                </button>
              </div>

              {/* Upload controls */}
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-[#374151]">{t("account.avatarLabel")}</p>
                <p className="text-xs text-[#6B7280]">{t("account.avatarHint")}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                    {t("account.uploadLogo")}
                  </Button>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      {t("account.removeLogo")}
                    </Button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="account-name" className="text-sm font-medium text-[#374151]">
                {t("account.nameLabel")}
              </Label>
              <Input
                id="account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("account.namePlaceholder")}
                className="max-w-sm"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#374151]">{t("account.emailLabel")}</Label>
              <Input value={user?.email ?? ""} disabled className="max-w-sm bg-[#F9FAFB] text-[#9CA3AF]" />
              <p className="text-xs text-[#9CA3AF]">{t("account.emailReadOnly")}</p>
            </div>

            {/* Save button */}
            <div className="pt-1">
              <Button
                onClick={handleSave}
                disabled={!isDirty || saving || !name.trim()}
                className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90 disabled:opacity-50"
                data-testid="button-save-account"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("account.saving")}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t("account.save")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
