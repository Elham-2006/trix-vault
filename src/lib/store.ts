// Client-side mock store for the Trix demo frontend.
// Persists to localStorage. Backend integration happens later.

const KEY = "trix_state_v1";
export const PLATFORM_WALLET = "THaPqM4rh7j49o35RaLp3H2TtTGgh1uM8t";
export const FEE_RATE = 0.02;

export type TxType = "deposit" | "withdraw" | "profit" | "referral" | "vip";
export type TxStatus = "pending" | "approved" | "rejected" | "completed";

export interface Transaction {
  id: string;
  userId: string;
  type: TxType;
  from: string;
  to: string;
  amount: number;
  fee: number;
  status: TxStatus;
  txid?: string;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // demo only — hashed server-side in real impl
  balance: number;
  totalEarned: number;
  todaysProfit: number;
  activePlanId?: string;
  referralCode: string;
  referredBy?: string;
  blocked: boolean;
  isAdmin: boolean;
  createdAt: number;
}

export interface VipPlan {
  id: string;
  name: string;
  minAmount: number;
  dailyPercent: number;
  durationDays: number;
  badge?: string;
}

export interface Notification { id: string; userId: string; title: string; body: string; read: boolean; timestamp: number; }

export interface AppState {
  users: User[];
  transactions: Transaction[];
  notifications: Notification[];
  plans: VipPlan[];
  currentUserId?: string;
}

const defaultPlans: VipPlan[] = [
  { id: "bronze", name: "Bronze", minAmount: 50, dailyPercent: 1.2, durationDays: 30 },
  { id: "silver", name: "Silver", minAmount: 250, dailyPercent: 1.6, durationDays: 45, badge: "Popular" },
  { id: "gold", name: "Gold", minAmount: 1000, dailyPercent: 2.1, durationDays: 60, badge: "Best value" },
  { id: "platinum", name: "Platinum", minAmount: 5000, dailyPercent: 2.8, durationDays: 90 },
  { id: "diamond", name: "Diamond", minAmount: 20000, dailyPercent: 3.5, durationDays: 120 },
];

const seedAdmin: User = {
  id: "admin", email: "admin@trix.io", name: "Admin", password: "admin",
  balance: 0, totalEarned: 0, todaysProfit: 0, referralCode: "ADMIN",
  blocked: false, isAdmin: true, createdAt: Date.now(),
};

const initial: AppState = {
  users: [seedAdmin],
  transactions: [],
  notifications: [],
  plans: defaultPlans,
};

function read(): AppState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.plans?.length) parsed.plans = defaultPlans;
    if (!parsed.users?.some(u => u.isAdmin)) parsed.users = [seedAdmin, ...(parsed.users || [])];
    return parsed;
  } catch { return initial; }
}

function write(s: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("trix:store"));
}

export const store = {
  get: read,
  set(updater: (s: AppState) => AppState) {
    const next = updater(read());
    write(next);
    return next;
  },
  reset() { write(initial); },
};

export function rid(prefix = "tx") {
  return prefix + "_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function currentUser(): User | undefined {
  const s = read();
  return s.users.find(u => u.id === s.currentUserId);
}

export function notify(userId: string, title: string, body: string) {
  store.set(s => ({ ...s, notifications: [{ id: rid("n"), userId, title, body, read: false, timestamp: Date.now() }, ...s.notifications] }));
}
