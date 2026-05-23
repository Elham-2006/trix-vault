import "@/lib/i18n";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { store } from "@/lib/store";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const s = store.get();
    if (!s.currentUserId) throw redirect({ to: "/login" });
  },
  component: () => <AppShell><Outlet /></AppShell>,
});
