"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useCourseProgress, useToggleLessonComplete } from "@/hooks/useProgress";

export default function StudentCoursePage() {
  const { data: dashboard, isLoading: isLoadingDashboard } = useStudentDashboard();
  const courseId = dashboard?.enrollment?.course._id ?? null;
  const { data: progress, isLoading: isLoadingProgress } = useCourseProgress(courseId);
  const toggleMutation = useToggleLessonComplete(courseId ?? "");

  const isLoading = isLoadingDashboard || (!!courseId && isLoadingProgress);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">My Course</h2>
        <p className="text-sm text-muted-foreground">
          Track your syllabus and module-by-module progress.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !dashboard?.enrollment ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            You are not enrolled in a course yet.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{dashboard.enrollment.course.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={progress?.overallProgress ?? 0} />
              <p className="text-sm text-muted-foreground">
                {progress?.overallProgress ?? 0}% complete · {progress?.totalCompleted ?? 0} of{" "}
                {progress?.totalLessons ?? 0} lessons
              </p>
            </CardContent>
          </Card>

          {!progress || progress.modules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No modules published for this course yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {progress.modules.map((mod) => (
                <Card key={mod.moduleId}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">{mod.name}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {mod.completedLessons}/{mod.totalLessons} · {mod.progress}%
                    </span>
                  </CardHeader>
                  <CardContent>
                    <Progress value={mod.progress} className="mb-3" />
                    {mod.lessons.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No lessons yet.</p>
                    ) : (
                      <ul className="space-y-1">
                        {mod.lessons.map((lesson) => (
                          <li
                            key={lesson.lessonId}
                            className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm"
                          >
                            <span className="flex items-center gap-2">
                              {lesson.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-status-good" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                              {lesson.title}
                              {lesson.estimatedMinutes ? (
                                <span className="text-xs text-muted-foreground">
                                  {lesson.estimatedMinutes} min
                                </span>
                              ) : null}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={toggleMutation.isPending}
                              onClick={() =>
                                toggleMutation.mutate({
                                  lessonId: lesson.lessonId,
                                  completed: lesson.completed,
                                })
                              }
                            >
                              {lesson.completed ? "Mark incomplete" : "Mark complete"}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
