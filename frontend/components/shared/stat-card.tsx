import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";

export type StatCardColor = "primary" | "secondary" | "accent" | "violet" | "green" | "critical";

const COLOR_STYLES: Record<StatCardColor, { chip: string; bar: string; value: string }> = {
  primary: {
    chip: "bg-primary/10 text-primary",
    bar: "bg-primary",
    value: "from-primary to-primary/60",
  },
  secondary: {
    chip: "bg-secondary/10 text-secondary",
    bar: "bg-secondary",
    value: "from-secondary to-secondary/60",
  },
  accent: {
    chip: "bg-accent/10 text-accent",
    bar: "bg-accent",
    value: "from-accent to-accent/60",
  },
  violet: {
    chip: "bg-chart-4/10 text-chart-4",
    bar: "bg-chart-4",
    value: "from-chart-4 to-chart-4/60",
  },
  green: {
    chip: "bg-chart-5/10 text-chart-5",
    bar: "bg-chart-5",
    value: "from-chart-5 to-chart-5/60",
  },
  critical: {
    chip: "bg-status-critical/10 text-status-critical",
    bar: "bg-status-critical",
    value: "from-status-critical to-status-critical/60",
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
    <Card className="relative overflow-hidden">
      <span className={cn("absolute inset-x-0 top-0 h-1", styles.bar)} />
      <CardContent className="flex items-center gap-4 pt-1">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", styles.chip)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              "bg-gradient-to-br bg-clip-text text-2xl font-bold tracking-tight text-transparent",
              styles.value
            )}
          >
            {value}
          </p>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
