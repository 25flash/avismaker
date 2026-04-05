import { Link } from "wouter";
import { Star, CreditCard, Globe, Zap, CheckCircle, ArrowRight, Building2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

function Navbar() {
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
          <Link href="/login">
            <button className="text-sm text-white/70 hover:text-white transition-colors px-3 py-2">
              Sign in
            </button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90 h-9 px-4 text-sm" data-testid="button-get-started-nav">
              Get started free
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm text-white/80 mb-8 border border-white/20">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>NFC & QR Review Cards for Modern Businesses</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Turn every customer into a{" "}
            <span className="text-primary">5-star review</span>
          </h1>

          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            AvisMakers smart cards let customers leave reviews on Google, TripAdvisor, Airbnb, and Trustpilot with a single tap or scan — no app required.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button
                className="bg-primary text-[#0D1117] font-bold hover:bg-primary/90 h-14 px-8 text-base"
                data-testid="button-hero-signup"
              >
                Start free today <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 h-14 px-8 text-base"
                data-testid="button-hero-login"
              >
                Sign in
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-white/40">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#10B981]" /> Free plan available</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#10B981]" /> No credit card needed</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#10B981]" /> Setup in 2 minutes</span>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 bg-white/5 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm text-white/40 mb-6">Trusted by businesses worldwide</p>
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
            <h2 className="text-3xl font-bold text-white mb-4">Everything you need to collect reviews</h2>
            <p className="text-white/60 max-w-xl mx-auto">No more hoping customers remember to leave a review. AvisMakers makes it effortless.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: CreditCard,
                title: "NFC & QR Cards",
                desc: "Physical cards that work with any smartphone. Customers tap or scan to instantly leave a review.",
                color: "bg-amber-500/20 text-amber-400",
              },
              {
                icon: Globe,
                title: "Multi-Platform",
                desc: "Google, TripAdvisor, Airbnb, Trustpilot — route customers to any review platform you choose.",
                color: "bg-blue-500/20 text-blue-400",
              },
              {
                icon: Zap,
                title: "Smart Review Flow",
                desc: "Unhappy customer? Capture feedback privately instead of sending them to your public review page.",
                color: "bg-green-500/20 text-green-400",
              },
              {
                icon: Bot,
                title: "AI Reply Generator",
                desc: "Generate professional responses to every review in seconds with built-in AI assistance.",
                color: "bg-purple-500/20 text-purple-400",
              },
              {
                icon: Building2,
                title: "Multi-Location",
                desc: "Manage cards for multiple locations from one dashboard. Perfect for chains and franchises.",
                color: "bg-pink-500/20 text-pink-400",
              },
              {
                icon: Star,
                title: "Analytics Dashboard",
                desc: "Track scan counts, review conversion, and identify your best performing cards.",
                color: "bg-orange-500/20 text-orange-400",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors"
              >
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
          <h2 className="text-3xl font-bold text-white mb-4">Set up in 3 simple steps</h2>
          <p className="text-white/60 mb-16">Get your first review in under 5 minutes</p>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Activate your card", desc: "Enter your card's unique activation code to claim it." },
              { step: "02", title: "Set your review link", desc: "Connect your Google, Airbnb, or TripAdvisor review page." },
              { step: "03", title: "Collect reviews", desc: "Customers tap or scan and leave a review instantly." },
            ].map((s) => (
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

      {/* Pricing preview */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-white/60 mb-16">Start free. Upgrade when you're ready.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { name: "Free", price: "€0", highlight: false },
              { name: "Premium", price: "€19", highlight: false },
              { name: "Pro", price: "€49", highlight: true },
              { name: "Business", price: "€99", highlight: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`p-5 rounded-xl border ${plan.highlight
                  ? "bg-primary/10 border-primary/50"
                  : "bg-white/5 border-white/10"
                }`}
              >
                <p className="text-sm text-white/60 mb-1">{plan.name}</p>
                <p className="text-2xl font-bold text-white">{plan.price}<span className="text-sm font-normal text-white/40">/mo</span></p>
                {plan.highlight && (
                  <span className="text-xs text-primary font-semibold">Most Popular</span>
                )}
              </div>
            ))}
          </div>

          <Link href="/signup">
            <Button
              className="bg-primary text-[#0D1117] font-bold hover:bg-primary/90 h-14 px-10 text-base"
              data-testid="button-pricing-cta"
            >
              Start free today <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary/10 border-t border-primary/20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get more reviews?</h2>
          <p className="text-white/60 mb-8">Join 2,400+ businesses using AvisMakers to grow their online reputation.</p>
          <Link href="/signup">
            <Button
              className="bg-primary text-[#0D1117] font-bold hover:bg-primary/90 h-14 px-10 text-base"
              data-testid="button-cta-signup"
            >
              Get started for free
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
          <p>© 2025 AvisMakers. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
