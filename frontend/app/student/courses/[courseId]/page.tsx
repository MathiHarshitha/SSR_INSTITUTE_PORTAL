"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseProgress } from "@/hooks/useProgress";
import { useMyEnrollments } from "@/hooks/useEnrollments";

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: "🟢 Beginner",
  INTERMEDIATE: "🟡 Intermediate",
  ADVANCED: "🔴 Advanced",
};

export default function StudentCourseCurriculumPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);

  const { data: enrollments } = useMyEnrollments();
  const { data: progress, isLoading } = useCourseProgress(courseId);

  const courseName = enrollments?.find((e) => e.course._id === courseId)?.course.name ?? "Course";

  return (
    <div className="space-y-6">
      <Link
        href="/student/courses"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-0")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my courses
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-foreground">{courseName}</h2>
        {progress && (
          <div className="mt-2 max-w-sm space-y-1">
            <Progress value={progress.overallProgress} />
            <p className="text-sm text-muted-foreground">
              {progress.overallProgress}% complete · {progress.totalCompleted}/{progress.totalLessons} lessons
            </p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !progress || progress.modules.length === 0 ? (
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
              <CardContent className="space-y-4">
                <Progress value={mod.progress} />
                {mod.topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No topics yet.</p>
                ) : (
                  mod.topics.map((topic) => (
                    <div key={topic.topicId} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{topic.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {topic.completedLessons}/{topic.totalLessons} · {topic.progress}%
                        </span>
                      </div>
                      {topic.lessons.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No lessons yet.</p>
                      ) : (
                        <ul className="space-y-1">
                          {topic.lessons.map((lesson) => (
                            <li key={lesson.lessonId}>
                              <Link
                                href={`/student/courses/${courseId}/lessons/${lesson.lessonId}`}
                                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                              >
                                <span className="flex items-center gap-2">
                                  {lesson.completed ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-status-good" />
                                  ) : (
                                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  )}
                                  {lesson.title}
                                </span>
                                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {lesson.quizBestScore !== undefined && (
                                    <Badge variant="outline">Quiz {lesson.quizBestScore}%</Badge>
                                  )}
                                  {DIFFICULTY_LABEL[lesson.difficulty] ?? lesson.difficulty}
                                  {lesson.estimatedMinutes ? ` · ${lesson.estimatedMinutes} min` : ""}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
