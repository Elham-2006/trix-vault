// Server functions for Trix business logic. RLS-friendly: uses admin client only
// after explicitly verifying the caller's identity / role via auth middleware.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyUsdtDeposit } from "./tron.server";
import { FEE_RATE, PLATFORM_WALLET } from "./constants";

async function isAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

async function pushNotif(userId: string, title: string, body: string) {
  await supabaseAdmin.from("notifications").insert({ user_id: userId, title, body });
}

// ------------------------------ DEPOSIT ------------------------------
export const submitDeposit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      amount: z.number().min(10).max(1_000_000),
      txid: z.string().trim().min(10).max(120),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    // Reject duplicate txid
    const { data: dup } = await supabaseAdmin
      .from("transactions")
      .select("id")
      .eq("txid", data.txid)
      .maybeSingle();
    if (dup) return { ok: false, error: "This TXID has already been submitted." };

    // Try on-chain verification (auto-approve if valid)
    const verify = await verifyUsdtDeposit(data.txid);
    let status: "pending" | "approved" = "pending";
    let amount = data.amount;
    let note: string | null = null;

    if (verify.valid && verify.amount) {
      status = "approved";
      amount = verify.amount;
      note = "auto-verified via TronGrid";
    } else if (verify.reason) {
      note = `verify: ${verify.reason}`;
    }

    const fee = +(amount * FEE_RATE).toFixed(2);
    const net = +(amount - fee).toFixed(2);

    const { data: tx, error } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        type: "deposit",
        amount,
        fee: status === "approved" ? fee : 0,
        status,
        txid: data.txid,
        from_addr: verify.from ?? null,
        to_addr: PLATFORM_WALLET,
        note,
      })
      .select()
      .single();
    if (error) return { ok: false, error: error.message };

    if (status === "approved") {
      // Credit user
      const { data: prof } = await supabaseAdmin
        .from("profiles").select("balance, referred_by").eq("id", userId).single();
      const newBalance = +(Number(prof?.balance ?? 0) + net).toFixed(2);
      await supabaseAdmin.from("profiles").update({ balance: newBalance }).eq("id", userId);

      // Referral bonus (8% of fee to referrer)
      if (prof?.referred_by) {
        const bonus = +(fee * 0.4).toFixed(2); // 40% of platform fee = ~0.8% of deposit
        if (bonus > 0) {
          const { data: refProf } = await supabaseAdmin
            .from("profiles").select("balance, total_earned").eq("id", prof.referred_by).single();
          await supabaseAdmin.from("profiles").update({
            balance: +(Number(refProf?.balance ?? 0) + bonus).toFixed(2),
            total_earned: +(Number(refProf?.total_earned ?? 0) + bonus).toFixed(2),
          }).eq("id", prof.referred_by);
          await supabaseAdmin.from("transactions").insert({
            user_id: prof.referred_by, type: "referral",
            amount: bonus, fee: 0, status: "completed",
            note: `Referral commission from deposit ${tx.id}`,
          });
          await pushNotif(prof.referred_by, "Referral bonus", `+$${bonus.toFixed(2)} from your referral's deposit.`);
        }
      }

      await pushNotif(userId, "Deposit approved", `$${net.toFixed(2)} credited (after 2% fee).`);
    } else {
      await pushNotif(userId, "Deposit submitted", `Your deposit of $${amount.toFixed(2)} is pending review.`);
    }

    return { ok: true, status, amount, fee };
  });

// ------------------------------ WITHDRAW ------------------------------
export const submitWithdraw = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      amount: z.number().min(10).max(1_000_000),
      wallet: z.string().trim().min(26).max(64),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { data: prof, error: pErr } = await supabaseAdmin
      .from("profiles").select("balance, blocked").eq("id", userId).single();
    if (pErr || !prof) return { ok: false, error: "Profile not found" };
    if (prof.blocked) return { ok: false, error: "Account blocked" };

    const balance = Number(prof.balance);
    if (data.amount > balance) return { ok: false, error: "Insufficient balance" };

    const fee = +(data.amount * FEE_RATE).toFixed(2);
    const newBalance = +(balance - data.amount).toFixed(2);

    await supabaseAdmin.from("profiles").update({ balance: newBalance }).eq("id", userId);
    const { error } = await supabaseAdmin.from("transactions").insert({
      user_id: userId, type: "withdraw",
      amount: data.amount, fee, status: "pending",
      from_addr: PLATFORM_WALLET, to_addr: data.wallet,
    });
    if (error) {
      // refund on insert error
      await supabaseAdmin.from("profiles").update({ balance }).eq("id", userId);
      return { ok: false, error: error.message };
    }
    await pushNotif(userId, "Withdrawal requested", `Your withdrawal of $${data.amount.toFixed(2)} is pending admin approval.`);
    return { ok: true };
  });

// ------------------------------ VIP ACTIVATE ------------------------------
export const activateVip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ planId: z.string().min(1).max(40) }).parse(input))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { data: plan } = await supabaseAdmin
      .from("vip_plans").select("*").eq("id", data.planId).maybeSingle();
    if (!plan) return { ok: false, error: "Invalid plan" };

    const { data: prof } = await supabaseAdmin
      .from("profiles").select("balance, blocked").eq("id", userId).single();
    if (!prof) return { ok: false, error: "Profile not found" };
    if (prof.blocked) return { ok: false, error: "Account blocked" };
    if (Number(prof.balance) < Number(plan.min_amount))
      return { ok: false, error: "Insufficient balance — deposit first" };

    const newBalance = +(Number(prof.balance) - Number(plan.min_amount)).toFixed(2);
    await supabaseAdmin.from("profiles").update({
      balance: newBalance,
      active_plan_id: plan.id,
      plan_started_at: new Date().toISOString(),
      last_profit_at: null,
    }).eq("id", userId);

    await supabaseAdmin.from("transactions").insert({
      user_id: userId, type: "vip",
      amount: plan.min_amount, fee: 0, status: "completed",
      note: `Activated ${plan.name} plan`,
    });
    await pushNotif(userId, "VIP activated", `${plan.name} is active — ${plan.daily_percent}% / day for ${plan.duration_days} days.`);
    return { ok: true };
  });

// ------------------------------ ADMIN OPS ------------------------------
async function requireAdmin(userId: string) {
  if (!(await isAdmin(userId))) throw new Error("Forbidden");
}

export const adminApprove = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ txId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { data: tx } = await supabaseAdmin
      .from("transactions").select("*").eq("id", data.txId).single();
    if (!tx) return { ok: false, error: "Not found" };
    if (tx.status !== "pending") return { ok: false, error: "Already processed" };

    if (tx.type === "deposit") {
      const fee = +(Number(tx.amount) * FEE_RATE).toFixed(2);
      const net = +(Number(tx.amount) - fee).toFixed(2);
      const { data: prof } = await supabaseAdmin
        .from("profiles").select("balance").eq("id", tx.user_id).single();
      await supabaseAdmin.from("profiles").update({
        balance: +(Number(prof?.balance ?? 0) + net).toFixed(2),
      }).eq("id", tx.user_id);
      await supabaseAdmin.from("transactions").update({ status: "approved", fee }).eq("id", tx.id);
      await pushNotif(tx.user_id, "Deposit approved", `$${net.toFixed(2)} credited.`);
    } else if (tx.type === "withdraw") {
      await supabaseAdmin.from("transactions").update({ status: "completed" }).eq("id", tx.id);
      await pushNotif(tx.user_id, "Withdrawal sent", `$${(Number(tx.amount) - Number(tx.fee)).toFixed(2)} sent.`);
    }
    return { ok: true };
  });

export const adminReject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ txId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { data: tx } = await supabaseAdmin
      .from("transactions").select("*").eq("id", data.txId).single();
    if (!tx) return { ok: false, error: "Not found" };
    if (tx.status !== "pending") return { ok: false, error: "Already processed" };

    if (tx.type === "withdraw") {
      // refund
      const { data: prof } = await supabaseAdmin
        .from("profiles").select("balance").eq("id", tx.user_id).single();
      await supabaseAdmin.from("profiles").update({
        balance: +(Number(prof?.balance ?? 0) + Number(tx.amount)).toFixed(2),
      }).eq("id", tx.user_id);
    }
    await supabaseAdmin.from("transactions").update({ status: "rejected" }).eq("id", tx.id);
    await pushNotif(tx.user_id, "Transaction rejected", `Your ${tx.type} of $${Number(tx.amount).toFixed(2)} was rejected.`);
    return { ok: true };
  });

export const adminToggleBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ targetUserId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { data: prof } = await supabaseAdmin
      .from("profiles").select("blocked").eq("id", data.targetUserId).single();
    if (!prof) return { ok: false };
    await supabaseAdmin.from("profiles").update({ blocked: !prof.blocked }).eq("id", data.targetUserId);
    return { ok: true };
  });

// ------------------------------ ADMIN READ ------------------------------
export const adminListPending = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: txs } = await supabaseAdmin
      .from("transactions").select("*").eq("status", "pending").order("created_at", { ascending: false });
    const ids = Array.from(new Set((txs ?? []).map(t => t.user_id)));
    const { data: profs } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, name").in("id", ids)
      : { data: [] as { id: string; name: string }[] };
    return { txs: txs ?? [], users: profs ?? [] };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: profiles } = await supabaseAdmin
      .from("profiles").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const adminIds = new Set((roles ?? []).filter(r => r.role === "admin").map(r => r.user_id));
    const { data: completed } = await supabaseAdmin
      .from("transactions").select("amount, fee").in("status", ["approved", "completed"]);
    const totalVolume = (completed ?? []).reduce((s, t) => s + Number(t.amount), 0);
    const totalFees = (completed ?? []).reduce((s, t) => s + Number(t.fee), 0);
    return {
      profiles: (profiles ?? []).map(p => ({ ...p, is_admin: adminIds.has(p.id) })),
      totalVolume, totalFees,
    };
  });

// ------------------------------ DAILY PROFIT (cron) ------------------------------
export const runDailyProfit = createServerFn({ method: "POST" }).handler(async () => {
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
    if (now - last < 86400_000) continue; // less than 24h since last credit

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
    count++;
  }
  return { ok: true, count };
});
