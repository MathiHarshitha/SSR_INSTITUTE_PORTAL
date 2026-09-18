"use client";

import { Layers, Users, ClipboardList, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";

const STAT_CARDS = [
  { label: "Assigned Batches", icon: Layers },
  { label: "Total Students", icon: Users },
  { label: "Pending Evaluations", icon: ClipboardList },
  { label: "Upcoming Interviews", icon: Video },
] as const;

export default function TrainerDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome back, {user?.name}</h2>
        <p className="text-sm text-muted-foreground">Here&apos;s your teaching overview for today.</p>
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
              <p className="text-xs text-muted-foreground">Live data wired in Phase 5</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming up next</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Batch rosters, class scheduling, materials, tasks, submissions, attendance and mock
          interviews will be built next, each backed by real API endpoints.
        </CardContent>
      </Card>
    </div>
  );
}
