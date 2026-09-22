"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, CheckCircle2, ClipboardCheck, Lock, XCircle } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAnswerFinalAssessment,
  useFinalAssessmentState,
  useStartFinalAssessment,
  useSubmitFinalAssessment,
} from "@/hooks/useFinalAssessment";
import { extractErrorMessage } from "@/lib/api-client";
import { FinalAssessmentSubmitResult } from "@/types/finalAssessment";

/** Same server-side session pattern as the lesson quiz (see lesson-quiz.tsx): the current
 * question, index, and grade all live server-side, so refresh/back-nav can't bypass it. */
export default function FinalAssessmentPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { data: state, isLoading, isError, error } = useFinalAssessmentState(courseId);
  const startAssessment = useStartFinalAssessment(courseId);
  const answerAssessment = useAnswerFinalAssessment(courseId);
  const submitAssessment = useSubmitFinalAssessment(courseId);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<FinalAssessmentSubmitResult | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [state?.currentIndex]);

  if (isError) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Lock className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground">{extractErrorMessage(error)}</p>
        <Link href={`/student/courses/${courseId}`} className={cn(buttonVariants({ size: "sm" }))}>
          Back to course
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const status = state?.status ?? "NOT_STARTED";

  async function handleStart() {
    setResult(null);
    setSelected(null);
    await startAssessment.mutateAsync();
  }

  async function handleNext() {
    if (selected === null || !state) return;
    const isLast = (state.currentIndex ?? 0) === state.totalQuestions - 1;
    await answerAssessment.mutateAsync(selected);
    setSelected(null);
    if (isLast) {
      const graded = await submitAssessment.mutateAsync();
      setResult(graded);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/student/courses/${courseId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-0")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
          <Award className="h-6 w-6 text-primary" />
          Final Assessment
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Completing this unlocks your certificate and career resources.
        </p>
      </div>

      {status === "NOT_STARTED" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium">{state?.totalQuestions} questions</p>
            <Button onClick={handleStart} disabled={startAssessment.isPending}>
              Start Final Assessment
            </Button>
          </CardContent>
        </Card>
      )}

      {status === "SUBMITTED" && !result && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm font-medium">
              You already completed this assessment — scored {state?.score}%
              {state?.passed ? " (passed)" : ""}.
            </p>
            <p className="text-xs text-muted-foreground">Your course completion has been recorded.</p>
          </CardContent>
        </Card>
      )}

      {status === "IN_PROGRESS" && state?.question && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Question {(state.currentIndex ?? 0) + 1} of {state.totalQuestions}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium">{state.question.question}</p>
            <div className="space-y-1.5">
              {state.question.options.map((option, oIndex) => (
                <button
                  key={oIndex}
                  type="button"
                  onClick={() => setSelected(oIndex)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                    selected === oIndex
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:bg-muted/60"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                disabled={selected === null || answerAssessment.isPending || submitAssessment.isPending}
              >
                {(state.currentIndex ?? 0) === state.totalQuestions - 1 ? "Submit Assessment" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            {result.passed ? (
              <CheckCircle2 className="h-10 w-10 text-status-good" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
            <p className="text-lg font-semibold">You scored {result.score}%</p>
            <p className="text-sm text-muted-foreground">
              {result.passed ? "You passed the final assessment." : "You did not reach the passing score."}
            </p>
            <p className="text-xs text-muted-foreground">
              Your course completion has been recorded — check your certificate and career resources.
            </p>
            <Link
              href={`/student/courses/${courseId}`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Back to course
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
