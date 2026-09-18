import { Construction, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description: string;
  phase: string;
  icon?: LucideIcon;
}

export function ComingSoon({ title, description, phase, icon: Icon = Construction }: ComingSoonProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardTitle className="mt-2 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{description}</p>
        <p className="text-xs">Planned for {phase}. No mock data — this will call real backend APIs once built.</p>
      </CardContent>
    </Card>
  );
}
