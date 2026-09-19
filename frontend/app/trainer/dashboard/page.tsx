"use client";

import { Layers, Users, ClipboardList, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";
import { useTrainerDashboard } from "@/hooks/useTrainerDashboard";
import { StatCard, StatCardColor } from "@/components/shared/stat-card";

export default function TrainerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading, isError } = useTrainerDashboard();

  const statCards: { label: string; value: string | number; icon: typeof Users; color: StatCardColor }[] =
    stats
      ? [
          { label: "Assigned Batches", value: stats.assignedBatches, icon: Layers, color: "primary" },
          { label: "Total Students", value: stats.totalStudents, icon: Users, color: "secondary" },
          {
            label: "Pending Evaluations",
            value: stats.pendingEvaluations,
            icon: ClipboardList,
            color: "accent",
          },
          { label: "Upcoming Interviews", value: stats.upcomingInterviews, icon: Video, color: "violet" },
        ]
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome back, {user?.name}</h2>
        <p className="text-sm text-muted-foreground">Here&apos;s your teaching overview for today.</p>
      </div>

      {isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Failed to load dashboard stats.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-7 w-14" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((card) => <StatCard key={card.label} {...card} />)}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s classes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : !stats || stats.todaysClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
            ) : (
              <ul className="space-y-2">
                {stats.todaysClasses.map((c) => (
                  <li key={c._id} className="rounded-md border border-border p-2 text-sm">
                    <p className="font-medium">{c.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.batch.name} · {c.startTime}–{c.endTime}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : !stats || stats.recentAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            ) : (
              <ul className="space-y-2">
                {stats.recentAnnouncements.map((a) => (
                  <li key={a._id} className="rounded-md border border-border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{a.title}</p>
                      <Badge variant="outline">{a.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
