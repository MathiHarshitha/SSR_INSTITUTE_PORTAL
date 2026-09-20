"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useMyEnrollments } from "@/hooks/useEnrollments";

export default function StudentCoursesPage() {
  const user = useAuthStore((s) => s.user);
  const { data: enrollments, isLoading } = useMyEnrollments();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome, {user?.name} 👋</h2>
        <p className="text-sm text-muted-foreground">Pick a course to continue learning.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : !enrollments || enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            You are not enrolled in any course yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <Card key={e.enrollmentId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  {e.course.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Progress value={e.overallProgress} />
                  <p className="text-xs text-muted-foreground">
                    {e.overallProgress}% complete · {e.totalCompleted}/{e.totalLessons} lessons
                  </p>
                </div>
                {e.lastVisitedLesson && (
                  <p className="truncate text-xs text-muted-foreground">
                    Continue: {e.lastVisitedLesson.title}
                  </p>
                )}
                <Link
                  href={`/student/courses/${e.course._id}`}
                  className={cn(buttonVariants({ size: "sm" }), "w-full")}
                >
                  Continue Learning →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
