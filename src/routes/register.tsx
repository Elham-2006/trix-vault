// i18n initialized via I18nInit in root
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { store, rid, notify } from "@/lib/store";
import { AuthFrame, Field } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Trix (TX)" }, { name: "description", content: "Join Trix and start earning daily." }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const search = Route.useSearch();
  const [form, setForm] = useState({ name: "", email: "", password: "", referral: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const ref = (search as any)?.ref ?? "";
    if (ref) setForm(s => ({ ...s, referral: String(ref) }));
  }, []);

  const set = (k: keyof typeof form) => (v: string) => setForm(s => ({ ...s, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    const s = store.get();
    if (s.users.some(u => u.email.toLowerCase() === form.email.toLowerCase())) {
      setError("Email already registered."); return;
    }
    const referrer = form.referral ? s.users.find(u => u.referralCode === form.referral.toUpperCase()) : undefined;
    const id = rid("u");
    const code = (form.name.slice(0, 3) + Math.random().toString(36).slice(2, 6)).toUpperCase();
    const user = {
      id, email: form.email, name: form.name, password: form.password,
      balance: 0, totalEarned: 0, todaysProfit: 0, referralCode: code, referredBy: referrer?.id,
      blocked: false, isAdmin: false, createdAt: Date.now(),
    };
    store.set(st => ({ ...st, users: [...st.users, user], currentUserId: id }));
    notify(id, "Welcome to Trix!", "Your account is ready. Make your first deposit to unlock VIP plans.");
    if (referrer) notify(referrer.id, "New referral", `${form.name} joined using your code.`);
    router.navigate({ to: "/app" });
  };

  return (
    <AuthFrame title={t("auth.create_account")}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("auth.name")} value={form.name} onChange={set("name")} required />
        <Field label={t("auth.email")} type="email" value={form.email} onChange={set("email")} required />
        <Field label={t("auth.password")} type="password" value={form.password} onChange={set("password")} required />
        <Field label={t("auth.referral")} value={form.referral} onChange={set("referral")} placeholder="OPTIONAL" />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button className="w-full rounded-xl bg-gradient-gold text-primary-foreground font-semibold py-3 shadow-glow-sm hover:opacity-90 transition">
          {t("auth.sign_up")}
        </button>
        <p className="text-sm text-center text-muted-foreground">
          {t("auth.have_account")} <Link to="/login" className="text-primary font-medium hover:underline">{t("auth.sign_in")}</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
