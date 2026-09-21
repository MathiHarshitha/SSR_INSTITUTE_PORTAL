import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "cn";

export type StatCardColor = "primary" | "secondary" | "accent" | "violet" | "green" | "critical";

const COLOR_STYLES: Record<StatCardColor, { chip: string; icon: string; value: string }> = {
  primary: {
    chip: "bg-blue-50 dark:bg-blue-500/10",
    icon: "text-blue-600 dark:text-blue-400",
    value: "text-blue-600 dark:text-blue-400",
  },
  accent: {
    chip: "bg-orange-50 dark:bg-orange-500/10",
    icon: "text-orange-500 dark:text-orange-400",
    value: "text-foreground",
  },
  secondary: {
    chip: "bg-teal-50 dark:bg-teal-500/10",
    icon: "text-teal-600 dark:text-teal-400",
    value: "text-foreground",
  },
  violet: {
    chip: "bg-violet-50 dark:bg-violet-500/10",
    icon: "text-violet-600 dark:text-violet-400",
    value: "text-foreground",
  },
  green: {
    chip: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
  },
  critical: {
    chip: "bg-rose-50 dark:bg-rose-500/10",
    icon: "text-rose-600 dark:text-rose-400",
    value: "text-rose-600 dark:text-rose-400",
  },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: StatCardColor;
}

export function StatCard({ label, value, icon: Icon, color = "primary" }: StatCardProps) {
  const styles = COLOR_STYLES[color];
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", styles.chip)}>
          <Icon className={cn("h-4 w-4", styles.icon)} />
        </div>
        <div className="min-w-0">
          <p className={cn("text-lg font-bold leading-tight tracking-tight", styles.value)}>{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
      <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground sm:flex">
        <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  );
}
