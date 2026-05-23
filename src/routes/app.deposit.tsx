import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Copy, Check, QrCode } from "lucide-react";
import { PLATFORM_WALLET } from "@/lib/constants";
import { submitDeposit } from "@/lib/trix.functions";

export const Route = createFileRoute("/app/deposit")({
  head: () => ({ meta: [{ title: "Deposit — Trix" }] }),
  component: Deposit,
});

function Deposit() {
  const { t } = useTranslation();
  const deposit = useServerFn(submitDeposit);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(PLATFORM_WALLET);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const amt = parseFloat(amount);
    if (!amt || amt < 10) { setMsg({ type: "err", text: "Minimum 10 USDT." }); return; }
    if (txid.trim().length < 10) { setMsg({ type: "err", text: "Please paste a valid TXID." }); return; }
    setLoading(true);
    try {
      const r = await deposit({ data: { amount: amt, txid: txid.trim() } });
      if (!r.ok) { setMsg({ type: "err", text: r.error ?? "Failed" }); }
      else if (r.status === "approved") {
        setMsg({ type: "ok", text: `✓ Verified on-chain. $${(r.amount - r.fee).toFixed(2)} credited.` });
        setAmount(""); setTxid("");
      } else {
        setMsg({ type: "ok", text: "✓ Submitted. Pending admin approval." });
        setAmount(""); setTxid("");
      }
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Failed" });
    }
    setLoading(false);
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
          <QrCode className="h-3.5 w-3.5" /> Send USDT (TRC20) to the address above, then paste the TXID below — we'll verify it on TRON automatically.
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
          <input value={txid} onChange={e => setTxid(e.target.value)} required placeholder="TRON tx hash"
            className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>
        {msg && <p className={`text-sm ${msg.type === "ok" ? "text-success" : "text-destructive"}`}>{msg.text}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-gradient-gold text-primary-foreground font-semibold py-3 shadow-glow-sm hover:opacity-90 transition disabled:opacity-60">
          {loading ? "Verifying on TRON…" : t("deposit.submit")}
        </button>
        <p className="text-xs text-muted-foreground">{t("deposit.note")}</p>
      </form>
    </div>
  );
}
