import "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/lib/i18n";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Coins, Users, Languages } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trix (TX) — Next-gen crypto wealth platform" },
      { name: "description", content: "VIP plans, daily profit, USDT TRC20 deposits and a transparent 2% fee. Available in 5 languages." },
      { property: "og:title", content: "Trix (TX) — Crypto wealth, simplified" },
      { property: "og:description", content: "Earn daily profit with VIP plans on the TRON network." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, i18n } = useTranslation();
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ambient gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[40%] -left-40 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[100px]" />
      </div>

      {/* Nav */}
      <header className="px-4 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-gold grid place-items-center font-display font-black text-primary-foreground shadow-glow-sm">T</div>
          <div className="leading-none">
            <div className="font-display font-bold text-lg">Trix</div>
            <div className="text-[10px] text-primary tracking-[0.2em]">TX</div>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden sm:block">
            <Languages className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={i18n.language?.split("-")[0]}
              onChange={e => i18n.changeLanguage(e.target.value)}
              className="appearance-none bg-secondary/80 text-sm rounded-lg pl-8 pr-3 py-1.5 border border-border"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>
          <Link to="/login" className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-secondary transition">{t("nav.login")}</Link>
          <Link to="/register" className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-gold text-primary-foreground shadow-glow-sm hover:opacity-90 transition">{t("nav.register")}</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 sm:px-8 pt-12 sm:pt-20 pb-16 max-w-6xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> {t("landing.tagline")}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight">
          {t("landing.title").split(" ").slice(0, -1).join(" ")}{" "}
          <span className="text-gradient-gold">Trix</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("landing.subtitle")}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-6 py-3 font-semibold text-primary-foreground shadow-glow hover:shadow-glow transition-all">
            {t("landing.cta_primary")} <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
          </Link>
          <Link to="/app/vip" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-6 py-3 font-semibold hover:bg-secondary transition">
            {t("landing.cta_secondary")}
          </Link>
        </motion.div>

        {/* stats */}
        <div className="mt-14 grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto">
          {[
            { v: "120K+", l: t("landing.stat_users") },
            { v: "$84M", l: t("landing.stat_volume") },
            { v: "$12.4M", l: t("landing.stat_paid") },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-display font-bold text-gradient-gold">{s.v}</div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-8 pb-24 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { i: Coins, t: t("landing.feature_1_title"), d: t("landing.feature_1_desc") },
            { i: Sparkles, t: t("landing.feature_2_title"), d: t("landing.feature_2_desc") },
            { i: Users, t: t("landing.feature_3_title"), d: t("landing.feature_3_desc") },
            { i: ShieldCheck, t: t("landing.feature_4_title"), d: t("landing.feature_4_desc") },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-gradient-card p-5 hover:border-primary/40 transition">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center mb-4">
                <f.i className="h-5 w-5" />
              </div>
              <div className="font-semibold">{f.t}</div>
              <div className="text-sm text-muted-foreground mt-1">{f.d}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Trix (TX). All rights reserved.
      </footer>
    </div>
  );
}
