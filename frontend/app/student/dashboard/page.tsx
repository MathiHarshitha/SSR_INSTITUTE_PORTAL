"use client";

import { GraduationCap, ClipboardList, CalendarClock, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/auth-store";

const STAT_CARDS = [
  { label: "Course Progress", icon: GraduationCap },
  { label: "Pending Tasks", icon: ClipboardList },
  { label: "Attendance", icon: CalendarClock },
  { label: "Fee Due", icon: Wallet },
] as const;

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome back, {user?.name}</h2>
        <p className="text-sm text-muted-foreground">Here&apos;s a snapshot of your learning journey.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ label, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">—</div>
              <p className="text-xs text-muted-foreground">Live data wired in Phase 6</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={0} />
          <p className="text-sm text-muted-foreground">
            Module-by-module progress, materials, tasks, attendance and job applications will be
            wired to real data next.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
