import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/lib/i18n";
import { useCurrentUser } from "@/hooks/use-store";
import { store } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — Trix" }] }),
  component: Profile,
});

function Profile() {
  const { t, i18n } = useTranslation();
  const user = useCurrentUser();
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  if (!user) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    store.set(s => ({ ...s, users: s.users.map(u => u.id === user.id ? { ...u, name } : u) }));
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("profile.title")}</h1>

      <form onSubmit={save} className="rounded-2xl border border-border bg-gradient-card p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-gold grid place-items-center text-2xl font-display font-black text-primary-foreground shadow-glow-sm">
            {user.name[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{user.email}</div>
            <div className="text-xs text-muted-foreground">Code: <span className="font-mono text-primary">{user.referralCode}</span></div>
          </div>
        </div>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.name")}</span>
          <input value={name} onChange={e => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("profile.language")}</span>
          <select value={i18n.language?.split("-")[0]} onChange={e => i18n.changeLanguage(e.target.value)}
            className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
          </select>
        </label>
        {saved && <p className="text-sm text-success">✓ Saved.</p>}
        <button className="rounded-xl bg-gradient-gold text-primary-foreground font-semibold px-6 py-2.5 shadow-glow-sm">{t("profile.save")}</button>
      </form>
    </div>
  );
}
