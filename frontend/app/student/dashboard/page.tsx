"use client";

import { GraduationCap, ClipboardList, CalendarClock, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading, isError } = useStudentDashboard();

  const statCards = stats
    ? [
        { label: "Course Progress", value: `${stats.courseProgress}%`, icon: GraduationCap },
        { label: "Pending Tasks", value: stats.pendingTasksCount, icon: ClipboardList },
        { label: "Attendance", value: `${stats.attendancePercentage}%`, icon: CalendarClock },
        { label: "Fee Due", value: `₹${stats.feeDue.toLocaleString("en-IN")}`, icon: Wallet },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome back, {user?.name}</h2>
        <p className="text-sm text-muted-foreground">Here&apos;s a snapshot of your learning journey.</p>
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
            : statCards.map(({ label, value, icon: Icon }) => (
                <Card key={label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{value}</div>
                  </CardContent>
                </Card>
              ))}
        </div>
      )}

      {!isLoading && stats?.enrollment && (
        <Card>
          <CardHeader>
            <CardTitle>{stats.enrollment.course.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={stats.courseProgress} />
            <p className="text-sm text-muted-foreground">
              {stats.courseProgress}% complete · {stats.enrollment.batch.name}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming classes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : !stats || stats.upcomingClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming classes.</p>
            ) : (
              <ul className="space-y-2">
                {stats.upcomingClasses.map((c) => (
                  <li key={c._id} className="rounded-md border border-border p-2 text-sm">
                    <p className="font-medium">{c.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.date).toLocaleDateString()} · {c.startTime}–{c.endTime}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent grades</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : !stats || stats.recentGrades.length === 0 ? (
              <p className="text-sm text-muted-foreground">No graded tasks yet.</p>
            ) : (
              <ul className="space-y-2">
                {stats.recentGrades.map((g) => (
                  <li key={g._id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                    <span>{g.task.title}</span>
                    <Badge variant="outline">
                      {g.marks}/{g.task.maxMarks}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
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
  );
}
