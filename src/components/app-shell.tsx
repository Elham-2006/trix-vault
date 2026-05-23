import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/lib/i18n-config";
import { useAuth, useProfile } from "@/hooks/use-trix";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Crown,
  Users, Receipt, UserRound, Bell, Shield, LogOut, Languages, Menu, X,
} from "lucide-react";
import { useState } from "react";

type NavLink = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; end?: boolean };
const links: NavLink[] = [
  { to: "/app", label: "dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/deposit", label: "deposit", icon: ArrowDownToLine },
  { to: "/app/withdraw", label: "withdraw", icon: ArrowUpFromLine },
  { to: "/app/vip", label: "vip", icon: Crown },
  { to: "/app/referrals", label: "referrals", icon: Users },
  { to: "/app/transactions", label: "transactions", icon: Receipt },
  { to: "/app/notifications", label: "notifications", icon: Bell },
  { to: "/app/profile", label: "profile", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const path = useRouterState({ select: r => r.location.pathname });
  const { user } = useAuth();
  const { profile, isAdmin } = useProfile(user?.id);
  const [open, setOpen] = useState(false);

  const isActive = (to: string, end?: boolean) =>
    end ? path === to : path === to || path.startsWith(to + "/");

  const logout = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/login" });
  };

  const Nav = (
    <nav className="flex flex-col gap-1 p-3">
      {links.map(l => {
        const Icon = l.icon;
        const active = isActive(l.to, l.end);
        return (
          <Link
            key={l.to} to={l.to}
            onClick={() => setOpen(false)}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
              ${active
                ? "bg-gradient-gold text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"}`}
          >
            <Icon className="h-4 w-4" />
            <span>{t(`nav.${l.label}`)}</span>
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          to="/app/admin" onClick={() => setOpen(false)}
          className={`mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium border border-primary/30
            ${isActive("/app/admin") ? "bg-primary/15 text-primary" : "text-primary/80 hover:bg-primary/10"}`}
        >
          <Shield className="h-4 w-4" /> {t("nav.admin")}
        </Link>
      )}
      <button
        onClick={logout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
      >
        <LogOut className="h-4 w-4" /> {t("nav.logout")}
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar sticky top-0 h-screen">
        <BrandHeader />
        {Nav}
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-sidebar border-r border-border h-full flex flex-col">
            <BrandHeader onClose={() => setOpen(false)} />
            {Nav}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-border">
          <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
            <button className="lg:hidden p-2 -ml-2" onClick={() => setOpen(true)} aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden font-display font-bold text-gradient-gold">Trix</div>
            <div className="flex-1" />
            <LanguagePicker />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-gradient-gold grid place-items-center text-primary-foreground font-bold text-sm">
                {(profile?.name ?? user?.email ?? "T")[0]?.toUpperCase()}
              </div>
              <div className="text-sm leading-tight">
                <div className="font-medium">{profile?.name ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );

  function BrandHeader({ onClose }: { onClose?: () => void } = {}) {
    return (
      <div className="flex items-center justify-between h-14 px-5 border-b border-sidebar-border">
        <Link to="/app" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-gold grid place-items-center font-display font-black text-primary-foreground">T</div>
          <div>
            <div className="font-display font-bold leading-none">Trix</div>
            <div className="text-[10px] text-primary tracking-widest">TX</div>
          </div>
        </Link>
        {onClose && <button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>}
      </div>
    );
  }

  function LanguagePicker() {
    return (
      <div className="relative">
        <select
          value={i18n.language?.split("-")[0]}
          onChange={e => i18n.changeLanguage(e.target.value)}
          className="appearance-none bg-secondary text-foreground text-sm rounded-lg pl-8 pr-3 py-1.5 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Language"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
          ))}
        </select>
        <Languages className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    );
  }
}
