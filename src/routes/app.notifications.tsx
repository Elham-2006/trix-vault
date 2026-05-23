import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/hooks/use-store";
import { store } from "@/lib/store";
import { Bell } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Trix" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const state = useStore();
  const items = state.notifications.filter(n => n.userId === user?.id);

  useEffect(() => {
    if (!user) return;
    if (items.some(n => !n.read)) {
      store.set(s => ({ ...s, notifications: s.notifications.map(n => n.userId === user.id ? { ...n, read: true } : n) }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return null;
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("notifications.title")}</h1>
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-2xl border border-border bg-gradient-card p-10 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            {t("notifications.empty")}
          </div>
        )}
        {items.map(n => (
          <div key={n.id} className="rounded-2xl border border-border bg-gradient-card p-4 flex gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0"><Bell className="h-4 w-4" /></div>
            <div className="min-w-0">
              <div className="font-semibold">{n.title}</div>
              <div className="text-sm text-muted-foreground">{n.body}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(n.timestamp).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
