"use client";

import Link from "next/link";
import { Users, GraduationCap, BookOpen, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { useAuthStore } from "@/store/auth-store";
import { useUserStats } from "@/hooks/useUsers";
import { UserStatusChart } from "@/components/admin/user-status-chart";
import { StatCard, StatCardColor } from "@/components/shared/stat-card";

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading, isError } = useUserStats();

  const statCards: { label: string; value: string | number; icon: typeof Users; color: StatCardColor }[] =
    stats
      ? [
          { label: "Total Students", value: stats.students.total, icon: GraduationCap, color: "primary" },
          {
            label: "Pending Approvals",
            value: stats.students.pending + stats.trainers.pending,
            icon: UserCheck,
            color: "accent",
          },
          { label: "Total Trainers", value: stats.trainers.total, icon: Users, color: "secondary" },
          { label: "Published Courses", value: stats.totalCourses, icon: BookOpen, color: "violet" },
        ]
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome back, {user?.name}</h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across SSR Institute today.
        </p>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Students &amp; trainers by status</CardTitle>
          </div>
          <Link
            href="/admin/users"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Manage users
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : stats ? (
            <UserStatusChart students={stats.students} trainers={stats.trainers} />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Enrollment, fees &amp; placement analytics</CardTitle>
            <p className="text-sm text-muted-foreground">
              Charts and exportable reports across every module, computed live.
            </p>
          </div>
          <Link href="/admin/reports" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            View reports
          </Link>
        </CardHeader>
      </Card>
    </div>
  );
}
