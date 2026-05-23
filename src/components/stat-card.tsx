import { cn } from "@/lib/utils";

export function StatCard({
  label, value, hint, icon: Icon, accent,
}: { label: string; value: React.ReactNode; hint?: string; icon?: React.ComponentType<{ className?: string }>; accent?: boolean }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-5",
      accent && "neon-border"
    )}>
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="flex items-center justify-between relative">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        {Icon && <Icon className="h-4 w-4 text-primary" />}
      </div>
      <div className="mt-3 text-2xl sm:text-3xl font-display font-bold relative">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1 relative">{hint}</div>}
    </div>
  );
}
