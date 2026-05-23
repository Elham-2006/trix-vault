// i18n initialized via I18nInit in root
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { store, rid } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Trix (TX)" }, { name: "description", content: "Sign in to your Trix account." }] }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const s = store.get();
    const user = s.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) { setError("Invalid email or password."); return; }
    if (user.blocked) { setError("Your account is blocked."); return; }
    store.set(st => ({ ...st, currentUserId: user.id }));
    router.navigate({ to: user.isAdmin ? "/app/admin" : "/app" });
  };

  const fillAdmin = () => { setEmail("admin@trix.io"); setPassword("admin"); };

  return (
    <AuthFrame title={t("auth.welcome_back")}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("auth.email")} type="email" value={email} onChange={setEmail} required />
        <Field label={t("auth.password")} type="password" value={password} onChange={setPassword} required />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button className="w-full rounded-xl bg-gradient-gold text-primary-foreground font-semibold py-3 shadow-glow-sm hover:opacity-90 transition">
          {t("auth.sign_in")}
        </button>
        <button type="button" onClick={fillAdmin} className="w-full text-xs text-muted-foreground hover:text-primary">
          Use demo admin (admin@trix.io / admin)
        </button>
        <p className="text-sm text-center text-muted-foreground">
          {t("auth.no_account")} <Link to="/register" className="text-primary font-medium hover:underline">{t("auth.sign_up")}</Link>
        </p>
      </form>
    </AuthFrame>
  );
}

export function AuthFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center px-4 py-10 relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-primary/15 blur-[120px]" />
      </div>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-gold grid place-items-center font-display font-black text-primary-foreground shadow-glow-sm">T</div>
          <div className="font-display font-bold text-xl">Trix <span className="text-primary text-sm">TX</span></div>
        </Link>
        <div className="glass rounded-2xl p-6 sm:p-8 shadow-elegant">
          <h1 className="text-2xl font-display font-bold mb-6">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, type = "text", value, onChange, required, placeholder }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type} value={value} required={required} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition"
      />
    </label>
  );
}
