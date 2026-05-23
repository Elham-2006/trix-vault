import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { useAuth, useProfile } from "@/hooks/use-trix";
import {
  adminApprove, adminReject, adminToggleBlock, adminListPending, adminListUsers,
} from "@/lib/trix.functions";
import { StatCard } from "@/components/stat-card";
import { Users, Wallet, TrendingUp, AlertCircle, Check, X, Ban } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

export const Route = createFileRoute("/app/admin")({
  head: () => ({ meta: [{ title: "Admin — Trix" }] }),
  component: AdminPage,
});

interface PendingTx {
  id: string; user_id: string; type: string; amount: number; fee: number;
  status: string; txid: string | null; to_addr: string | null;
}
interface UserRow {
  id: string; name: string; balance: number; blocked: boolean; is_admin: boolean;
}

function AdminPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, loading } = useProfile(user?.id);
  const listPending = useServerFn(adminListPending);
  const listUsers = useServerFn(adminListUsers);
  const approve = useServerFn(adminApprove);
  const reject = useServerFn(adminReject);
  const toggleBlock = useServerFn(adminToggleBlock);

  const [pending, setPending] = useState<PendingTx[]>([]);
  const [pendingNames, setPendingNames] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<UserRow[]>([]);
  const [totals, setTotals] = useState({ volume: 0, fees: 0 });

  const reload = useCallback(async () => {
    const [p, u] = await Promise.all([listPending(), listUsers()]);
    setPending((p.txs as PendingTx[]).map(t => ({ ...t, amount: Number(t.amount), fee: Number(t.fee) })));
    setPendingNames(Object.fromEntries((p.users as { id: string; name: string }[]).map(x => [x.id, x.name])));
    setUsers((u.profiles as UserRow[]).map(x => ({ ...x, balance: Number(x.balance) })));
    setTotals({ volume: u.totalVolume, fees: u.totalFees });
  }, [listPending, listUsers]);

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) { router.navigate({ to: "/app" }); return; }
    reload();
  }, [loading, isAdmin, router, reload]);

  if (loading || !isAdmin) return null;

  const onApprove = async (id: string) => { await approve({ data: { txId: id } }); reload(); };
  const onReject  = async (id: string) => { await reject({ data: { txId: id } }); reload(); };
  const onBlock   = async (id: string) => { await toggleBlock({ data: { targetUserId: id } }); reload(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("admin.title")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard accent label={t("admin.total_fees")} value={<span className="text-gradient-gold">${totals.fees.toFixed(2)}</span>} icon={TrendingUp} />
        <StatCard label={t("admin.total_volume")} value={`$${totals.volume.toFixed(2)}`} icon={Wallet} />
        <StatCard label={t("admin.total_users")} value={users.filter(u => !u.is_admin).length} icon={Users} />
        <StatCard label={t("admin.pending_count")} value={pending.length} icon={AlertCircle} />
      </div>

      <Section title={t("admin.deposits") + " / " + t("admin.withdrawals")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-3 py-2">User</th><th className="text-left">Type</th><th className="text-right">Amount</th><th className="text-left">TXID/To</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pending.map(tx => (
                <tr key={tx.id}>
                  <td className="px-3 py-3">{pendingNames[tx.user_id] ?? tx.user_id.slice(0, 6)}</td>
                  <td className="capitalize">{tx.type}</td>
                  <td className="text-right font-semibold">${tx.amount.toFixed(2)}</td>
                  <td className="font-mono text-xs break-all max-w-[200px]">{tx.txid ?? tx.to_addr}</td>
                  <td className="text-right space-x-2 py-2">
                    <button onClick={() => onApprove(tx.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-success/15 text-success px-3 py-1.5 text-xs font-semibold hover:bg-success/25">
                      <Check className="h-3.5 w-3.5" /> {t("admin.approve")}
                    </button>
                    <button onClick={() => onReject(tx.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-destructive/15 text-destructive px-3 py-1.5 text-xs font-semibold hover:bg-destructive/25">
                      <X className="h-3.5 w-3.5" /> {t("admin.reject")}
                    </button>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No pending requests.</td></tr>}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={t("admin.users")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-3 py-2">Name</th><th className="text-right">Balance</th><th className="text-left">Status</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.filter(u => !u.is_admin).map(u => (
                <tr key={u.id}>
                  <td className="px-3 py-3">{u.name}</td>
                  <td className="text-right font-semibold">${u.balance.toFixed(2)}</td>
                  <td>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${u.blocked ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
                      {u.blocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="text-right py-2">
                    <button onClick={() => onBlock(u.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-secondary/70">
                      <Ban className="h-3.5 w-3.5" /> {u.blocked ? t("admin.unblock") : t("admin.block")}
                    </button>
                  </td>
                </tr>
              ))}
              {users.filter(u => !u.is_admin).length === 0 &&
                <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No users yet.</td></tr>}
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
