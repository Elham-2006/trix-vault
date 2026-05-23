import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useAuth, useProfile, useTransactions } from "@/hooks/use-trix";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Copy, Check, Users } from "lucide-react";

export const Route = createFileRoute("/app/referrals")({
  head: () => ({ meta: [{ title: "Referrals — Trix" }] }),
  component: Referrals,
});

function Referrals() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { txs } = useTransactions(user?.id);
  const [invites, setInvites] = useState<{ id: string; name: string; created_at: string }[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("id, name, created_at").eq("referred_by", user.id)
      .then(({ data }) => setInvites(data ?? []));
  }, [user?.id]);

  if (!profile) return null;
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${profile.referral_code}`;
  const earnings = txs.filter(tx => tx.type === "referral").reduce((s, t) => s + t.amount, 0);
  const tiers = [{ tier: 1, commission: "0.8%" }];

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("referrals.title")}</h1>

      <div className="rounded-2xl border border-primary/30 bg-gradient-card p-5 neon-border">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{t("referrals.your_link")}</div>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <code className="flex-1 min-w-0 text-sm font-mono break-all bg-background/60 rounded-lg px-3 py-2 border border-border">{link}</code>
          <button onClick={copy} className="inline-flex items-center gap-2 rounded-lg bg-gradient-gold text-primary-foreground px-4 py-2 text-sm font-semibold">
            {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
          </button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">Your code: <span className="text-primary font-mono">{profile.referral_code}</span></div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-gradient-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />{t("referrals.invites")}</div>
          <div className="text-3xl font-display font-bold mt-2">{invites.length}</div>
          <div className="mt-3 divide-y divide-border text-sm">
            {invites.map(i => (
              <div key={i.id} className="py-2 flex justify-between">
                <span>{i.name}</span><span className="text-muted-foreground text-xs">{new Date(i.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {invites.length === 0 && <div className="py-2 text-sm text-muted-foreground">No invites yet.</div>}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{t("referrals.earnings")}</div>
          <div className="text-3xl font-display font-bold mt-2 text-gradient-gold">${earnings.toFixed(2)}</div>
          <div className="mt-4 space-y-2 text-sm">
            {tiers.map(tt => (
              <div key={tt.tier} className="flex justify-between items-center rounded-lg bg-background/40 px-3 py-2 border border-border">
                <span>Per deposit</span><span className="text-primary font-semibold">{tt.commission}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
