import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/hooks/use-store";
import { PLATFORM_WALLET, store, rid, notify } from "@/lib/store";
import { useState } from "react";
import { Copy, Check, QrCode } from "lucide-react";

export const Route = createFileRoute("/app/deposit")({
  head: () => ({ meta: [{ title: "Deposit — Trix" }] }),
  component: Deposit,
});

function Deposit() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  if (!user) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(PLATFORM_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setOk(false);
    const amt = parseFloat(amount);
    if (!amt || amt < 10) { setErr("Minimum 10 USDT."); return; }
    if (txid.trim().length < 10) { setErr("Please paste a valid TXID."); return; }
    store.set(s => ({
      ...s,
      transactions: [{
        id: rid("dep"), userId: user.id, type: "deposit",
        from: txid.trim().slice(0, 10) + "…", to: PLATFORM_WALLET,
        amount: amt, fee: 0, status: "pending", txid: txid.trim(), timestamp: Date.now(),
      }, ...s.transactions],
    }));
    notify(user.id, "Deposit submitted", `Your deposit of $${amt.toFixed(2)} is pending admin approval.`);
    setAmount(""); setTxid(""); setOk(true);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("deposit.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("deposit.desc")}</p>
      </div>

      <div className="rounded-2xl border border-primary/30 bg-gradient-card p-5 neon-border">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{t("deposit.wallet_label")} · USDT TRC20</div>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <code className="flex-1 min-w-0 text-sm sm:text-base font-mono break-all bg-background/60 rounded-lg px-3 py-2 border border-border">
            {PLATFORM_WALLET}
          </code>
          <button onClick={copy} className="inline-flex items-center gap-2 rounded-lg bg-gradient-gold text-primary-foreground px-4 py-2 text-sm font-semibold shadow-glow-sm">
            {copied ? <><Check className="h-4 w-4" /> {t("deposit.copied")}</> : <><Copy className="h-4 w-4" /> {t("deposit.copy")}</>}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <QrCode className="h-3.5 w-3.5" /> Scan with your wallet app to copy address
        </div>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-gradient-card p-5 space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("deposit.amount")}</span>
          <input type="number" min="10" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required
            className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("deposit.txid")}</span>
          <input value={txid} onChange={e => setTxid(e.target.value)} required placeholder="0x… or TRON tx hash"
            className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>
        {err && <p className="text-sm text-destructive">{err}</p>}
        {ok && <p className="text-sm text-success">✓ Deposit submitted for review.</p>}
        <button className="w-full rounded-xl bg-gradient-gold text-primary-foreground font-semibold py-3 shadow-glow-sm hover:opacity-90 transition">
          {t("deposit.submit")}
        </button>
        <p className="text-xs text-muted-foreground">{t("deposit.note")}</p>
      </form>
    </div>
  );
}
