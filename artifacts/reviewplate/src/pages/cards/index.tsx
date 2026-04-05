import { AuthLayout } from "@/components/layout/AuthLayout";
import { useListCards, useListBusinessProfiles } from "@workspace/api-client-react";
import { CreditCard, Plus, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; dot: string; pill: string }> = {
  active:   { label: "Active",     dot: "bg-[#10B981]", pill: "bg-[#D1FAE5] text-[#065F46]" },
  inactive: { label: "Inactive",   dot: "bg-[#F59E0B]", pill: "bg-[#FEF3C7] text-[#92400E]" },
  disabled: { label: "Désactivée", dot: "bg-[#9CA3AF]", pill: "bg-[#F3F4F6] text-[#6B7280]" },
};

const platformColors: Record<string, string> = {
  google: "bg-blue-100 text-blue-700",
  airbnb: "bg-red-100 text-red-700",
  tripadvisor: "bg-green-100 text-green-700",
  trustpilot: "bg-emerald-100 text-emerald-700",
  multilink: "bg-purple-100 text-purple-700",
  social: "bg-pink-100 text-pink-700",
};

interface BusinessProfile {
  id: number;
  name: string;
  logoUrl: string | null;
}

export default function CardsPage() {
  const { data: cards, isLoading } = useListCards();
  const { data: profiles } = useListBusinessProfiles();

  const cardList = (cards as unknown as Array<{
    id: number;
    code: string;
    status: string;
    platform: string | null;
    targetUrl: string | null;
    businessProfileId: number | null;
    scanCount: number;
    smartReviewEnabled: boolean;
    createdAt: string;
    activatedAt: string | null;
  }>) ?? [];

  const profileMap = ((profiles as unknown as BusinessProfile[]) ?? []).reduce<Record<number, BusinessProfile>>(
    (acc, p) => { acc[p.id] = p; return acc; },
    {}
  );

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1117]">Mes Cartes</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Gérez vos cartes NFC et QR d'avis</p>
          </div>
          <Link href="/activate">
            <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90" data-testid="button-activate-new">
              <Plus className="w-4 h-4 mr-2" />
              Activer une carte
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : cardList.length === 0 ? (
          <Card className="bg-white border border-border">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-[#0D1117] mb-2">Aucune carte</h3>
              <p className="text-sm text-[#6B7280] mb-6 max-w-xs mx-auto">
                Activez votre première carte NFC ou QR pour commencer à collecter des avis automatiquement.
              </p>
              <Link href="/activate">
                <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90" data-testid="button-activate-first">
                  <Plus className="w-4 h-4 mr-2" />
                  Activer ma première carte
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cardList.map((card) => {
              const linkedProfile = card.businessProfileId ? profileMap[card.businessProfileId] : null;
              return (
                <Link key={card.id} href={`/cards/${card.id}`}>
                  <Card
                    className="bg-white border border-border shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/30"
                    data-testid={`card-product-${card.id}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        {/* Left: logo or code badge */}
                        {linkedProfile?.logoUrl ? (
                          <img
                            src={linkedProfile.logoUrl}
                            alt={linkedProfile.name}
                            className="w-12 h-12 rounded-xl object-cover border border-border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#0D1117] rounded-xl flex items-center justify-center">
                            <span className="text-sm font-mono font-bold text-primary">{card.code.slice(0, 3)}</span>
                          </div>
                        )}
                        {(() => {
                          const s = statusConfig[card.status] ?? statusConfig.disabled;
                          return (
                            <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full", s.pill)}>
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
                              {s.label}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Nom principal : nickname > nom profil > fallback */}
                      {card.nickname ? (
                        <p className="text-base font-bold text-[#0D1117] mb-0 truncate">{card.nickname}</p>
                      ) : linkedProfile ? (
                        <p className="text-base font-bold text-[#0D1117] mb-0 truncate">{linkedProfile.name}</p>
                      ) : (
                        <p className="text-base font-bold text-[#9CA3AF] mb-0">Sans nom</p>
                      )}
                      {/* Profil en secondaire si nickname défini */}
                      {card.nickname && linkedProfile && (
                        <p className="text-xs text-[#9CA3AF] truncate mb-0">{linkedProfile.name}</p>
                      )}

                      {/* Plateforme en secondaire */}
                      <div className="flex items-center gap-2 mt-1">
                        {card.smartReviewEnabled && (
                          <span className="text-xs bg-purple-100 text-purple-700 font-medium px-2 py-0.5 rounded">Smart</span>
                        )}
                        {card.platform ? (
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded", platformColors[card.platform] ?? "bg-gray-100 text-gray-700")}>
                            {card.platform}
                          </span>
                        ) : (
                          <span className="text-xs text-[#9CA3AF]">Plateforme non définie</span>
                        )}
                      </div>

                      {/* Code carte en bas */}
                      <p className="text-xs font-mono text-[#9CA3AF] mt-1">{card.code}</p>

                      <div className="flex items-center justify-between text-sm border-t border-[#F3F4F6] pt-3 mt-3">
                        <div className="flex items-center gap-1.5 text-[#6B7280]">
                          <Activity className="w-3.5 h-3.5" />
                          <span className="font-semibold text-[#374151]">{card.scanCount}</span>
                          <span>scans</span>
                        </div>
                        {card.activatedAt && (
                          <p className="text-xs text-[#9CA3AF]">
                            {new Date(card.activatedAt).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
