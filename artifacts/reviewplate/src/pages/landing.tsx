import { Link } from "wouter";
import { Star, CreditCard, Globe, Zap, CheckCircle, ArrowRight, Building2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function Navbar() {
  const { t } = useTranslation();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D1117]/95 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Star className="w-4 h-4 text-[#0D1117]" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-white">AvisMakers</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="dark" />
          <Link href="/login">
            <button className="text-sm text-white/70 hover:text-white transition-colors px-3 py-2">
              {t("landing.signIn")}
            </button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90 h-9 px-4 text-sm" data-testid="button-get-started-nav">
              {t("landing.getStartedFree")}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    { icon: CreditCard, title: t("landing.features.nfcQr"), desc: t("landing.features.nfcQrDesc"), color: "bg-amber-500/20 text-amber-400" },
    { icon: Globe, title: t("landing.features.multiPlatform"), desc: t("landing.features.multiPlatformDesc"), color: "bg-blue-500/20 text-blue-400" },
    { icon: Zap, title: t("landing.features.smartFlow"), desc: t("landing.features.smartFlowDesc"), color: "bg-green-500/20 text-green-400" },
    { icon: Bot, title: t("landing.features.aiReply"), desc: t("landing.features.aiReplyDesc"), color: "bg-purple-500/20 text-purple-400" },
    { icon: Building2, title: t("landing.features.multiLocation"), desc: t("landing.features.multiLocationDesc"), color: "bg-pink-500/20 text-pink-400" },
    { icon: Star, title: t("landing.features.analytics"), desc: t("landing.features.analyticsDesc"), color: "bg-orange-500/20 text-orange-400" },
  ];

  const steps = [
    { step: "01", title: t("landing.steps.step1Title"), desc: t("landing.steps.step1Desc") },
    { step: "02", title: t("landing.steps.step2Title"), desc: t("landing.steps.step2Desc") },
    { step: "03", title: t("landing.steps.step3Title"), desc: t("landing.steps.step3Desc") },
  ];

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm text-white/80 mb-8 border border-white/20">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>{t("landing.tagline")}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            {t("landing.heroTitle")}{" "}
            <span className="text-primary">{t("landing.heroTitleHighlight")}</span>
          </h1>

          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("landing.heroDesc")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button className="bg-primary text-[#0D1117] font-bold hover:bg-primary/90 h-14 px-8 text-base" data-testid="button-hero-signup">
                {t("landing.startFreeToday")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14 px-8 text-base" data-testid="button-hero-login">
                {t("landing.signIn")}
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-white/40">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#10B981]" /> {t("landing.freePlanAvailable")}</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#10B981]" /> {t("landing.noCreditCard")}</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#10B981]" /> {t("landing.setupIn2Min")}</span>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 bg-white/5 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm text-white/40 mb-6">{t("landing.trustedBy")}</p>
          <div className="flex flex-wrap justify-center gap-8 text-white/50 font-medium text-sm">
            {["Restaurants", "Hotels", "Cafes", "Retail Shops", "Salons", "Airbnb Hosts"].map(type => (
              <span key={type}>{type}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">{t("landing.featuresTitle")}</h2>
            <p className="text-white/60 max-w-xl mx-auto">{t("landing.featuresDesc")}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white/5 border-y border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t("landing.howItWorksTitle")}</h2>
          <p className="text-white/60 mb-16">{t("landing.howItWorksDesc")}</p>

          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">{s.step}</span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-white/50">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary/10 border-t border-primary/20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t("landing.ctaTitle")}</h2>
          <p className="text-white/60 mb-8">{t("landing.ctaDesc")}</p>
          <Link href="/signup">
            <Button className="bg-primary text-[#0D1117] font-bold hover:bg-primary/90 h-14 px-10 text-base" data-testid="button-cta-signup">
              {t("landing.getStartedForFree")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Star className="w-3 h-3 text-[#0D1117]" strokeWidth={2.5} />
            </div>
            <span>AvisMakers</span>
          </div>
          <p>© 2025 AvisMakers. {t("landing.allRightsReserved")}</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-white transition-colors">{t("landing.signIn")}</Link>
            <Link href="/signup" className="hover:text-white transition-colors">{t("landing.getStartedFree")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
