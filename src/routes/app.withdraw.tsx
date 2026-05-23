import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/hooks/use-store";
import { store, rid, notify, FEE_RATE, PLATFORM_WALLET } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/app/withdraw")({
  head: () => ({ meta: [{ title: "Withdraw — Trix" }] }),
  component: Withdraw,
});

function Withdraw() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  if (!user) return null;

  const amt = parseFloat(amount) || 0;
  const fee = +(amt * FEE_RATE).toFixed(2);
  const net = +(amt - fee).toFixed(2);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setOk(false);
    if (amt < 10) return setErr("Minimum 10 USDT.");
    if (amt > user.balance) return setErr("Insufficient balance.");
    if (wallet.length < 26) return setErr("Enter a valid TRC20 address.");
    store.set(s => ({
      ...s,
      users: s.users.map(u => u.id === user.id ? { ...u, balance: +(u.balance - amt).toFixed(2) } : u),
      transactions: [{
        id: rid("wd"), userId: user.id, type: "withdraw",
        from: PLATFORM_WALLET, to: wallet,
        amount: amt, fee, status: "pending", timestamp: Date.now(),
      }, ...s.transactions],
    }));
    notify(user.id, "Withdrawal requested", `Your withdrawal of $${amt.toFixed(2)} is pending approval.`);
    setAmount(""); setWallet(""); setOk(true);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("withdraw.title")}</h1>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-gradient-card p-5 space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("withdraw.to_wallet")}</span>
          <input value={wallet} onChange={e => setWallet(e.target.value)} required placeholder="T…"
            className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("withdraw.amount")}</span>
          <input type="number" min="10" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required
            className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <span className="text-xs text-muted-foreground mt-1 block">Balance: ${user.balance.toFixed(2)}</span>
        </label>

        <div className="rounded-xl border border-border bg-background/50 p-4 space-y-1 text-sm">
          <Row label={t("withdraw.amount")} value={`$${amt.toFixed(2)}`} />
          <Row label={t("withdraw.fee")} value={`-$${fee.toFixed(2)}`} muted />
          <div className="border-t border-border my-2" />
          <Row label={t("withdraw.net")} value={<span className="text-gradient-gold font-bold">${net.toFixed(2)}</span>} />
        </div>

        {err && <p className="text-sm text-destructive">{err}</p>}
        {ok && <p className="text-sm text-success">✓ Withdrawal request created.</p>}
        <button className="w-full rounded-xl bg-gradient-gold text-primary-foreground font-semibold py-3 shadow-glow-sm hover:opacity-90 transition">
          {t("withdraw.submit")}
        </button>
        <p className="text-xs text-muted-foreground">{t("withdraw.min")}</p>
      </form>
    </div>
  );
}
function Row({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
