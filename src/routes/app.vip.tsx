import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { useAuth, useProfile, useVipPlans } from "@/hooks/use-trix";
import { activateVip } from "@/lib/trix.functions";
import { Crown, Check, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/vip")({
  head: () => ({ meta: [{ title: "VIP plans — Trix" }] }),
  component: VipPage,
});

function VipPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const plans = useVipPlans();
  const activate = useServerFn(activateVip);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  if (!profile) return null;

  const onActivate = async (planId: string) => {
    setMsg(null);
    try {
      const r = await activate({ data: { planId } });
      if (!r.ok) setMsg({ type: "err", text: r.error ?? "Failed" });
      else setMsg({ type: "ok", text: "Plan activated!" });
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Failed" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("vip.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("vip.subtitle")}</p>
      </div>
      {msg && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${
          msg.type === "ok" ? "border-primary/40 bg-primary/10 text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"
        }`}>{msg.text}</div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => {
          const active = profile.active_plan_id === plan.id;
          return (
            <div key={plan.id} className={`relative rounded-2xl border bg-gradient-card p-5 transition ${active ? "border-primary neon-border" : "border-border hover:border-primary/40"}`}>
              {plan.badge && (
                <div className="absolute -top-2.5 right-4 text-[10px] font-bold uppercase tracking-widest bg-gradient-gold text-primary-foreground px-2 py-0.5 rounded-full shadow-glow-sm">
                  {plan.badge}
                </div>
              )}
              <div className="flex items-center gap-2 text-primary">
                <Crown className="h-5 w-5" />
                <div className="font-display text-xl font-bold">{plan.name}</div>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold text-gradient-gold">{plan.daily_percent}%</span>
                <span className="text-sm text-muted-foreground">/ {t("vip.daily")}</span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <Line text={`${t("vip.min")}: $${plan.min_amount.toLocaleString()}`} />
                <Line text={`${t("vip.duration")}: ${plan.duration_days} ${t("vip.days")}`} />
                <Line text={`Withdraw anytime`} />
              </div>
              <button
                disabled={active}
                onClick={() => onActivate(plan.id)}
                className={`mt-5 w-full rounded-xl py-2.5 font-semibold transition ${active
                  ? "bg-primary/15 text-primary cursor-default"
                  : "bg-gradient-gold text-primary-foreground shadow-glow-sm hover:opacity-90"}`}>
                {active ? <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> Active</span> : t("vip.choose")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function Line({ text }: { text: string }) {
  return <div className="flex items-center gap-2 text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary" /> {text}</div>;
}
