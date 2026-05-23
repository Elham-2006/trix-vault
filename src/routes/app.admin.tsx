import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useStore, useCurrentUser } from "@/hooks/use-store";
import { store, notify, FEE_RATE } from "@/lib/store";
import { StatCard } from "@/components/stat-card";
import { Users, Wallet, TrendingUp, AlertCircle, Check, X, Ban } from "lucide-react";

export const Route = createFileRoute("/app/admin")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const s = store.get();
    const u = s.users.find(x => x.id === s.currentUserId);
    if (!u?.isAdmin) throw redirect({ to: "/app" });
  },
  head: () => ({ meta: [{ title: "Admin — Trix" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const state = useStore();
  if (!user?.isAdmin) return null;

  const totalUsers = state.users.filter(u => !u.isAdmin).length;
  const completed = state.transactions.filter(t => t.status === "completed" || t.status === "approved");
  const totalVolume = completed.reduce((s, t) => s + t.amount, 0);
  const totalFees = completed.reduce((s, t) => s + t.fee, 0);
  const pending = state.transactions.filter(t => t.status === "pending");

  const approveDeposit = (id: string) => {
    store.set(s => {
      const tx = s.transactions.find(t => t.id === id);
      if (!tx) return s;
      const fee = +(tx.amount * FEE_RATE).toFixed(2);
      const net = +(tx.amount - fee).toFixed(2);
      return {
        ...s,
        transactions: s.transactions.map(t => t.id === id ? { ...t, status: "approved", fee } : t),
        users: s.users.map(u => u.id === tx.userId ? { ...u, balance: +(u.balance + net).toFixed(2) } : u),
      };
    });
    const tx = store.get().transactions.find(t => t.id === id);
    if (tx) notify(tx.userId, "Deposit approved", `$${tx.amount.toFixed(2)} credited (after 2% fee).`);
  };

  const approveWithdraw = (id: string) => {
    store.set(s => ({ ...s, transactions: s.transactions.map(t => t.id === id ? { ...t, status: "completed" } : t) }));
    const tx = store.get().transactions.find(t => t.id === id);
    if (tx) notify(tx.userId, "Withdrawal sent", `$${(tx.amount - tx.fee).toFixed(2)} sent to ${tx.to.slice(0, 10)}…`);
  };

  const reject = (id: string) => {
    store.set(s => {
      const tx = s.transactions.find(t => t.id === id);
      if (!tx) return s;
      const refund = tx.type === "withdraw"
        ? s.users.map(u => u.id === tx.userId ? { ...u, balance: +(u.balance + tx.amount).toFixed(2) } : u)
        : s.users;
      return {
        ...s,
        users: refund,
        transactions: s.transactions.map(t => t.id === id ? { ...t, status: "rejected" } : t),
      };
    });
    const tx = store.get().transactions.find(t => t.id === id);
    if (tx) notify(tx.userId, "Transaction rejected", `Your ${tx.type} of $${tx.amount.toFixed(2)} was rejected.`);
  };

  const toggleBlock = (uid: string) => {
    store.set(s => ({ ...s, users: s.users.map(u => u.id === uid ? { ...u, blocked: !u.blocked } : u) }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("admin.title")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard accent label={t("admin.total_fees")} value={<span className="text-gradient-gold">${totalFees.toFixed(2)}</span>} icon={TrendingUp} />
        <StatCard label={t("admin.total_volume")} value={`$${totalVolume.toFixed(2)}`} icon={Wallet} />
        <StatCard label={t("admin.total_users")} value={totalUsers} icon={Users} />
        <StatCard label={t("admin.pending_count")} value={pending.length} icon={AlertCircle} />
      </div>

      <Section title={t("admin.deposits") + " / " + t("admin.withdrawals")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-3 py-2">User</th><th className="text-left">Type</th><th className="text-right">Amount</th><th className="text-left">TXID/To</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pending.map(tx => {
                const u = state.users.find(u => u.id === tx.userId);
                return (
                  <tr key={tx.id}>
                    <td className="px-3 py-3">{u?.name} <span className="text-xs text-muted-foreground">({u?.email})</span></td>
                    <td className="capitalize">{tx.type}</td>
                    <td className="text-right font-semibold">${tx.amount.toFixed(2)}</td>
                    <td className="font-mono text-xs break-all max-w-[200px]">{tx.txid ?? tx.to}</td>
                    <td className="text-right space-x-2 py-2">
                      <button onClick={() => tx.type === "deposit" ? approveDeposit(tx.id) : approveWithdraw(tx.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-success/15 text-success px-3 py-1.5 text-xs font-semibold hover:bg-success/25">
                        <Check className="h-3.5 w-3.5" /> {t("admin.approve")}
                      </button>
                      <button onClick={() => reject(tx.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-destructive/15 text-destructive px-3 py-1.5 text-xs font-semibold hover:bg-destructive/25">
                        <X className="h-3.5 w-3.5" /> {t("admin.reject")}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {pending.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No pending requests.</td></tr>}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={t("admin.users")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-3 py-2">Name</th><th className="text-left">Email</th><th className="text-right">Balance</th><th className="text-left">Status</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {state.users.filter(u => !u.isAdmin).map(u => (
                <tr key={u.id}>
                  <td className="px-3 py-3">{u.name}</td>
                  <td className="text-muted-foreground">{u.email}</td>
                  <td className="text-right font-semibold">${u.balance.toFixed(2)}</td>
                  <td>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${u.blocked ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
                      {u.blocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="text-right py-2">
                    <button onClick={() => toggleBlock(u.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-secondary/70">
                      <Ban className="h-3.5 w-3.5" /> {u.blocked ? t("admin.unblock") : t("admin.block")}
                    </button>
                  </td>
                </tr>
              ))}
              {state.users.filter(u => !u.isAdmin).length === 0 &&
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No users yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5">
      <h2 className="font-display font-semibold text-lg mb-4">{title}</h2>
      {children}
    </div>
  );
}
