import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = (search as Record<string, unknown>)?.ref;
    if (ref) setForm(s => ({ ...s, referral: String(ref) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: keyof typeof form) => (v: string) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: {
          name: form.name,
          referred_by_code: form.referral.toUpperCase(),
        },
      },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
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
        <button disabled={loading} className="w-full rounded-xl bg-gradient-gold text-primary-foreground font-semibold py-3 shadow-glow-sm hover:opacity-90 transition disabled:opacity-60">
          {loading ? "…" : t("auth.sign_up")}
        </button>
        <p className="text-sm text-center text-muted-foreground">
          {t("auth.have_account")} <Link to="/login" className="text-primary font-medium hover:underline">{t("auth.sign_in")}</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
