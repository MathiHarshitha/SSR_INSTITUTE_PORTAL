"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LessonQuiz } from "@/components/student/lesson-quiz";
import { CodingQuestion } from "@/components/student/coding-question";
import { useLesson, useMarkPracticeComplete } from "@/hooks/useLesson";
import { useCourseProgress, useToggleLessonComplete } from "@/hooks/useProgress";
import { useUpdateLastVisited } from "@/hooks/useEnrollments";
import { extractErrorMessage } from "@/lib/api-client";

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: "🟢 Beginner",
  INTERMEDIATE: "🟡 Intermediate",
  ADVANCED: "🔴 Advanced",
};

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);

  const { data: lesson, isLoading, isError, error } = useLesson(lessonId);
  const { data: progress } = useCourseProgress(courseId);
  const toggleComplete = useToggleLessonComplete(courseId);
  const markPracticeComplete = useMarkPracticeComplete(lessonId);
  const updateLastVisited = useUpdateLastVisited();
  const [quizActive, setQuizActive] = useState(false);

  useEffect(() => {
    updateLastVisited.mutate({ courseId, lessonId });
    setQuizActive(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId]);

  const flatLessons = useMemo(
    () =>
      progress ? progress.modules.flatMap((m) => m.topics.flatMap((t) => t.lessons)) : [],
    [progress]
  );
  const currentIndex = flatLessons.findIndex((l) => l.lessonId === lessonId);
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  if (isError) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium">This lesson isn&apos;t available yet</p>
          <p className="mt-1 text-sm text-muted-foreground">{extractErrorMessage(error)}</p>
        </div>
        <Link href={`/student/courses/${courseId}`} className={cn(buttonVariants({ size: "sm" }))}>
          Back to curriculum
        </Link>
      </div>
    );
  }

  if (isLoading || !lesson) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const hasStages = lesson.stage.practiceRequired || lesson.stage.quizRequired || lesson.stage.codingRequired;
  const canOpenQuiz = !lesson.stage.practiceRequired || lesson.stage.practiceDone;
  const canOpenCoding = lesson.stage.quizRequired ? lesson.stage.quizDone : canOpenQuiz;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/student/courses/${courseId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-0")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to curriculum
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-foreground">{lesson.title}</h1>
          <Badge variant="outline">{DIFFICULTY_LABEL[lesson.difficulty] ?? lesson.difficulty}</Badge>
          {lesson.lockState === "COMPLETED" && (
            <Badge className="gap-1 bg-status-good/10 text-status-good hover:bg-status-good/10">
              <CheckCircle2 className="h-3 w-3" /> Completed · revision
            </Badge>
          )}
        </div>
        {lesson.estimatedMinutes ? (
          <p className="mt-1 text-sm text-muted-foreground">⏱ {lesson.estimatedMinutes} minutes</p>
        ) : null}
      </div>

      {!quizActive && (
        <>
          <Section title="What is it?">{lesson.whatIsIt}</Section>
          <Section title="Why do we need it?">{lesson.whyItMatters}</Section>
          <Section title="Think of it like this">{lesson.analogy}</Section>
          <Section title="Simple example">{lesson.simpleExample}</Section>
          {lesson.technicalExplanation && (
            <Section title="Technical explanation">{lesson.technicalExplanation}</Section>
          )}

          {lesson.codeExamples.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lesson.codeExamples.map((example, i) => (
                  <div key={i} className="space-y-1.5">
                    {example.title && <p className="text-sm font-medium">{example.title}</p>}
                    <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                      <code>{example.code}</code>
                    </pre>
                    {example.explanation && (
                      <p className="text-sm text-muted-foreground">{example.explanation}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {lesson.realWorldUsage && (
            <Section title="Real-world usage">{lesson.realWorldUsage}</Section>
          )}

          {lesson.practice && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Try it yourself</CardTitle>
                {lesson.stage.practiceDone && <CheckCircle2 className="h-4 w-4 text-status-good" />}
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{lesson.practice.instructions}</p>
                {lesson.practice.starterCode && (
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                    <code>{lesson.practice.starterCode}</code>
                  </pre>
                )}
                {lesson.practice.hint && (
                  <p className="text-xs text-muted-foreground">Hint: {lesson.practice.hint}</p>
                )}
                {!lesson.stage.practiceDone && (
                  <Button
                    size="sm"
                    onClick={() => markPracticeComplete.mutate()}
                    disabled={markPracticeComplete.isPending}
                  >
                    {markPracticeComplete.isPending ? "Saving..." : "I've completed this practice"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {(lesson.commonMistakes.length > 0 || lesson.keyTakeaways.length > 0) && (
            <Card>
              <CardContent className="pt-4">
                <Accordion>
                  {lesson.commonMistakes.length > 0 && (
                    <AccordionItem value="mistakes">
                      <AccordionTrigger>Common mistakes</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        {lesson.commonMistakes.map((m, i) => (
                          <div key={i} className="text-sm">
                            <p className="text-destructive">✗ {m.wrong}</p>
                            <p className="text-status-good">✓ {m.right}</p>
                            {m.explanation && (
                              <p className="text-xs text-muted-foreground">{m.explanation}</p>
                            )}
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {lesson.keyTakeaways.length > 0 && (
                    <AccordionItem value="takeaways">
                      <AccordionTrigger>Key takeaways</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc space-y-1 pl-5 text-sm">
                          {lesson.keyTakeaways.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {lesson.rememberThis && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <p className="text-sm font-medium">💡 Remember this</p>
                <p className="mt-1 text-sm text-muted-foreground">{lesson.rememberThis}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {lesson.quiz.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            {canOpenQuiz ? (
              <LessonQuiz
                lessonId={lessonId}
                questions={lesson.quiz}
                bestScore={lesson.quizBestScore}
                onActiveChange={setQuizActive}
              />
            ) : (
              <LockedStage label="Complete the practice exercise above to unlock the quiz" />
            )}
          </CardContent>
        </Card>
      )}

      {lesson.codingQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coding Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            {canOpenCoding ? (
              <CodingQuestion
                lessonId={lessonId}
                question={lesson.codingQuestion}
                completed={lesson.codingCompleted}
              />
            ) : (
              <LockedStage label="Pass the quiz above to unlock the coding challenge" />
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        {hasStages ? (
          <p className="flex items-center gap-2 text-sm font-medium">
            {lesson.completed ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-status-good" /> Lesson completed
              </>
            ) : (
              "Complete every step above to finish this lesson"
            )}
          </p>
        ) : (
          <Button
            variant={lesson.completed ? "outline" : "default"}
            disabled={toggleComplete.isPending}
            onClick={() => toggleComplete.mutate({ lessonId, completed: lesson.completed })}
          >
            <CheckCircle2 className="h-4 w-4" />
            {lesson.completed ? "Mark incomplete" : "Mark Complete"}
          </Button>
        )}

        <div className="flex gap-2">
          {prevLesson && (
            <Link
              href={`/student/courses/${courseId}/lessons/${prevLesson.lessonId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Link>
          )}
          {nextLesson && nextLesson.state !== "LOCKED" && (
            <Link
              href={`/student/courses/${courseId}/lessons/${nextLesson.lessonId}`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Next: {nextLesson.title}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children?: string }) {
  if (!children) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

function LockedStage({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
      <Lock className="h-4 w-4 shrink-0" />
      {label}
    </div>
  );
}
