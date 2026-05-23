import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useAuth, useTransactions } from "@/hooks/use-trix";

export const Route = createFileRoute("/app/transactions")({
  head: () => ({ meta: [{ title: "Transactions — Trix" }] }),
  component: Transactions,
});

const statusClass: Record<string, string> = {
  pending: "bg-primary/15 text-primary",
  approved: "bg-success/15 text-success",
  completed: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
};

function Transactions() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { txs } = useTransactions(user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("transactions.title")}</h1>

      <div className="rounded-2xl border border-border bg-gradient-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">{t("transactions.id")}</th>
                <th className="text-left px-4 py-3">{t("transactions.type")}</th>
                <th className="text-right px-4 py-3">{t("transactions.amount")}</th>
                <th className="text-right px-4 py-3">{t("transactions.fee")}</th>
                <th className="text-left px-4 py-3">{t("transactions.status")}</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">{t("transactions.date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {txs.map(tx => (
                <tr key={tx.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs">{tx.id.slice(0, 14)}…</td>
                  <td className="px-4 py-3 capitalize">{tx.type}</td>
                  <td className="px-4 py-3 text-right font-semibold">${tx.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">${tx.fee.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${statusClass[tx.status] ?? ""}`}>
                      {t(`transactions.${tx.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">{new Date(tx.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
