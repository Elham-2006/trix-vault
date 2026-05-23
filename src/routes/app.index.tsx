import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/hooks/use-store";
import { StatCard } from "@/components/stat-card";
import { Wallet, TrendingUp, Coins, Crown, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — Trix" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const state = useStore();
  if (!user) return null;
  const plan = state.plans.find(p => p.id === user.activePlanId);
  const recent = state.transactions.filter(tx => tx.userId === user.id).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted-foreground">{t("dashboard.hello")},</div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold mt-1">{user.name} 👋</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard accent label={t("dashboard.wallet_balance")} value={<><span className="text-gradient-gold">${user.balance.toFixed(2)}</span></>} hint="USDT" icon={Wallet} />
        <StatCard label={t("dashboard.todays_profit")} value={`+$${user.todaysProfit.toFixed(2)}`} hint="Last 24h" icon={TrendingUp} />
        <StatCard label={t("dashboard.total_earned")} value={`$${user.totalEarned.toFixed(2)}`} icon={Coins} />
        <StatCard label={t("dashboard.active_plan")} value={plan?.name ?? t("dashboard.none")} hint={plan ? `${plan.dailyPercent}% / day` : "—"} icon={Crown} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Link to="/app/deposit" className="group relative overflow-hidden rounded-2xl bg-gradient-gold p-5 text-primary-foreground shadow-glow-sm hover:shadow-glow transition">
          <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/15 blur-xl group-hover:scale-110 transition" />
          <div className="flex items-center gap-3 relative">
            <ArrowDownToLine className="h-6 w-6" />
            <div>
              <div className="font-semibold text-lg">{t("dashboard.quick_deposit")}</div>
              <div className="text-xs opacity-80">USDT TRC20</div>
            </div>
          </div>
        </Link>
        <Link to="/app/withdraw" className="rounded-2xl border border-border bg-gradient-card p-5 hover:border-primary/50 transition">
          <div className="flex items-center gap-3">
            <ArrowUpFromLine className="h-6 w-6 text-primary" />
            <div>
              <div className="font-semibold text-lg">{t("dashboard.quick_withdraw")}</div>
              <div className="text-xs text-muted-foreground">2% network fee</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">{t("dashboard.recent_tx")}</h2>
          <Link to="/app/transactions" className="text-xs text-primary hover:underline">{t("dashboard.view_all")}</Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">{t("dashboard.empty")}</div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium capitalize">{tx.type}</div>
                  <div className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className={tx.type === "withdraw" || tx.type === "vip" ? "text-destructive" : "text-success"}>
                    {tx.type === "withdraw" || tx.type === "vip" ? "-" : "+"}${tx.amount.toFixed(2)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{tx.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
