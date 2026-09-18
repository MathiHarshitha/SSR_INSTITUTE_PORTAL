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

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading, isError } = useUserStats();

  const statCards = stats
    ? [
        { label: "Total Students", value: stats.students.total, icon: GraduationCap },
        { label: "Pending Approvals", value: stats.students.pending + stats.trainers.pending, icon: UserCheck },
        { label: "Total Trainers", value: stats.trainers.total, icon: Users },
        { label: "Published Courses", value: stats.totalCourses, icon: BookOpen },
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
        <CardHeader>
          <CardTitle>Coming up next</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Batch, fee, and placement analytics will appear here once those modules ship in later
          phases — all backed by real aggregation queries, same as the numbers above.
        </CardContent>
      </Card>
    </div>
  );
}
