import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  name: string;
  referral_code: string;
  referred_by: string | null;
  balance: number;
  total_earned: number;
  blocked: boolean;
  active_plan_id: string | null;
  plan_started_at: string | null;
  last_profit_at: string | null;
  created_at: string;
}

export interface Tx {
  id: string;
  user_id: string;
  type: "deposit" | "withdraw" | "profit" | "referral" | "vip";
  amount: number;
  fee: number;
  status: "pending" | "approved" | "rejected" | "completed";
  txid: string | null;
  from_addr: string | null;
  to_addr: string | null;
  note: string | null;
  created_at: string;
}

export interface Notif {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface VipPlan {
  id: string;
  name: string;
  min_amount: number;
  daily_percent: number;
  duration_days: number;
  badge: string | null;
  sort_order: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) { setProfile(null); setIsAdmin(false); setLoading(false); return; }
    const [{ data: p }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfile(p ? { ...p, balance: Number(p.balance), total_earned: Number(p.total_earned) } as Profile : null);
    setIsAdmin(!!roles?.some(r => r.role === "admin"));
    setLoading(false);
  }, [userId]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel(`profile-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
        () => reload())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, reload]);

  return { profile, isAdmin, loading, reload };
}

export function useTransactions(userId?: string) {
  const [txs, setTxs] = useState<Tx[]>([]);
  const reload = useCallback(async () => {
    if (!userId) return setTxs([]);
    const { data } = await supabase.from("transactions").select("*")
      .eq("user_id", userId).order("created_at", { ascending: false });
    setTxs((data ?? []).map(t => ({ ...t, amount: Number(t.amount), fee: Number(t.fee) })) as Tx[]);
  }, [userId]);
  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    if (!userId) return;
    const ch = supabase.channel(`tx-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${userId}` },
        () => reload()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, reload]);
  return { txs, reload };
}

export function useNotifications(userId?: string) {
  const [items, setItems] = useState<Notif[]>([]);
  const reload = useCallback(async () => {
    if (!userId) return setItems([]);
    const { data } = await supabase.from("notifications").select("*")
      .eq("user_id", userId).order("created_at", { ascending: false });
    setItems((data ?? []) as Notif[]);
  }, [userId]);
  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    if (!userId) return;
    const ch = supabase.channel(`notif-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => reload()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, reload]);
  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
  }, [userId]);
  return { items, markAllRead, reload };
}

export function useVipPlans() {
  const [plans, setPlans] = useState<VipPlan[]>([]);
  useEffect(() => {
    supabase.from("vip_plans").select("*").order("sort_order").then(({ data }) => {
      setPlans((data ?? []).map(p => ({
        ...p,
        min_amount: Number(p.min_amount),
        daily_percent: Number(p.daily_percent),
      })) as VipPlan[]);
    });
  }, []);
  return plans;
}
