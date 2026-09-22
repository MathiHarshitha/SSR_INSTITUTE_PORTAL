"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseProgress } from "@/hooks/useProgress";
import { useMyEnrollments } from "@/hooks/useEnrollments";
import { ProgressState } from "@/types/progress";

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
              Course Progress: {progress.overallProgress}% · {progress.totalCompleted}/{progress.totalLessons} lessons
            </p>
          </div>
        )}
        {progress?.allModulesCompleted && (
          <div className="mt-3 flex flex-wrap gap-2">
            {progress.hasFinalAssessment && (
              <Link
                href={`/student/courses/${courseId}/final-assessment`}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                {progress.courseCompleted ? "View Final Assessment" : "Take Final Assessment"}
              </Link>
            )}
            {progress.courseCompleted && (
              <Badge className="gap-1 bg-status-good/10 text-status-good hover:bg-status-good/10">
                <CheckCircle2 className="h-3 w-3" /> Course Completed
              </Badge>
            )}
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
            <Card key={mod.moduleId} className={cn(mod.state === "LOCKED" && "opacity-70")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <StateIcon state={mod.state} />
                  {mod.name}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {mod.completedLessons}/{mod.totalLessons} · {mod.progress}%
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={mod.progress} />
                {mod.state === "LOCKED" ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" /> Complete the previous module to unlock
                  </p>
                ) : mod.topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No topics yet.</p>
                ) : (
                  mod.topics.map((topic) => (
                    <div key={topic.topicId} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <StateIcon state={topic.state} />
                          {topic.name}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {topic.completedLessons}/{topic.totalLessons} · {topic.progress}%
                        </span>
                      </div>
                      {topic.state === "LOCKED" ? (
                        <p className="flex items-center gap-2 pl-1 text-xs text-muted-foreground">
                          <Lock className="h-3.5 w-3.5" /> Complete the previous topic to unlock
                        </p>
                      ) : topic.lessons.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No lessons yet.</p>
                      ) : (
                        <ul className="space-y-1">
                          {topic.lessons.map((lesson) => {
                            const locked = lesson.state === "LOCKED";
                            const content = (
                              <>
                                <span className="flex items-center gap-2">
                                  <StateIcon state={lesson.state} />
                                  {lesson.title}
                                </span>
                                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {lesson.quizBestScore !== undefined && (
                                    <Badge variant="outline">Quiz {lesson.quizBestScore}%</Badge>
                                  )}
                                  {DIFFICULTY_LABEL[lesson.difficulty] ?? lesson.difficulty}
                                  {lesson.estimatedMinutes ? ` · ${lesson.estimatedMinutes} min` : ""}
                                </span>
                              </>
                            );
                            return (
                              <li key={lesson.lessonId}>
                                {locked ? (
                                  <div className="flex cursor-not-allowed items-center justify-between rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                                    {content}
                                  </div>
                                ) : (
                                  <Link
                                    href={`/student/courses/${courseId}/lessons/${lesson.lessonId}`}
                                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                                  >
                                    {content}
                                  </Link>
                                )}
                              </li>
                            );
                          })}
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

function StateIcon({ state }: { state: ProgressState }) {
  if (state === "COMPLETED") return <CheckCircle2 className="h-4 w-4 shrink-0 text-status-good" />;
  if (state === "LOCKED") return <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />;
  if (state === "IN_PROGRESS") return <PlayCircle className="h-4 w-4 shrink-0 text-primary" />;
  return <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />;
}
