// Cron endpoint — pg_cron calls this every hour; daily profit pays out per-user
// once every 24h. Anyone can hit it; running it more often than 24h does nothing.
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/hooks/daily-profit")({
  server: {
    handlers: {
      POST: async () => {
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("id, balance, active_plan_id, plan_started_at, last_profit_at, total_earned")
          .not("active_plan_id", "is", null);
        const { data: plans } = await supabaseAdmin.from("vip_plans").select("*");
        const planMap = new Map((plans ?? []).map(p => [p.id, p]));
        const now = Date.now();
        let count = 0;

        for (const p of profiles ?? []) {
          const plan = planMap.get(p.active_plan_id!);
          if (!plan) continue;
          const startedAt = p.plan_started_at ? new Date(p.plan_started_at).getTime() : now;
          const expiresAt = startedAt + plan.duration_days * 86400_000;
          if (now > expiresAt) {
            await supabaseAdmin.from("profiles").update({ active_plan_id: null }).eq("id", p.id);
            continue;
          }
          const last = p.last_profit_at ? new Date(p.last_profit_at).getTime() : startedAt;
          if (now - last < 86400_000) continue;

          const profit = +(Number(plan.min_amount) * Number(plan.daily_percent) / 100).toFixed(2);
          await supabaseAdmin.from("profiles").update({
            balance: +(Number(p.balance) + profit).toFixed(2),
            total_earned: +(Number(p.total_earned) + profit).toFixed(2),
            last_profit_at: new Date().toISOString(),
          }).eq("id", p.id);
          await supabaseAdmin.from("transactions").insert({
            user_id: p.id, type: "profit", amount: profit, fee: 0, status: "completed",
            note: `Daily profit (${plan.name})`,
          });
          await supabaseAdmin.from("notifications").insert({
            user_id: p.id, title: "Daily profit",
            body: `+$${profit.toFixed(2)} from ${plan.name} plan`,
          });
          count++;
        }
        return new Response(JSON.stringify({ ok: true, count }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
