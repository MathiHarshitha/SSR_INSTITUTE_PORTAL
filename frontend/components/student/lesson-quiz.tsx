"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ListChecks, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "cn";
import {
  useAnswerQuiz,
  useQuizState,
  useQuitQuiz,
  useStartQuiz,
  useSubmitQuiz,
} from "@/hooks/useLesson";
import { QuizSubmitResult, StudentQuizQuestion } from "@/types/module";

interface LessonQuizProps {
  lessonId: string;
  /** Full question bank, used only to render the post-submit review (options/explanations
   * for questions already answered) — the live in-progress question always comes from the
   * server session, never from this list, so there's nothing to "look ahead" at. */
  questions: StudentQuizQuestion[];
  bestScore?: number;
  onActiveChange?: (active: boolean) => void;
}

/**
 * Every question, the current index, and the final grade are held server-side (see
 * services/module.service.ts's quiz session calls). This component is a thin view over
 * that state: it never keeps its own copy of "which question am I on" across a request,
 * so a refresh or browser back/forward just re-fetches wherever the server says the
 * attempt actually is — there's no local state to fall out of sync or roll back.
 */
export function LessonQuiz({ lessonId, questions, bestScore, onActiveChange }: LessonQuizProps) {
  const { data: state, isLoading } = useQuizState(lessonId);
  const startQuiz = useStartQuiz(lessonId);
  const answerQuiz = useAnswerQuiz(lessonId);
  const submitQuiz = useSubmitQuiz(lessonId);
  const quitQuiz = useQuitQuiz(lessonId);
  const [selected, setSelected] = useState<number | null>(null);
  const [quitConfirmOpen, setQuitConfirmOpen] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  const status = state?.status ?? "NOT_STARTED";

  useEffect(() => {
    onActiveChange?.(status === "IN_PROGRESS");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  async function handleStart() {
    setResult(null);
    setSelected(null);
    await startQuiz.mutateAsync();
  }

  async function handleNext() {
    if (selected === null || !state) return;
    const isLast = (state.currentIndex ?? 0) === state.totalQuestions - 1;
    await answerQuiz.mutateAsync(selected);
    setSelected(null);
    if (isLast) {
      const graded = await submitQuiz.mutateAsync();
      setResult(graded);
    }
  }

  function confirmQuit() {
    setQuitConfirmOpen(false);
    quitQuiz.mutate();
    setSelected(null);
    setResult(null);
  }

  if (status === "QUIT") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
        <p className="text-sm text-muted-foreground">You quit this attempt — it was recorded as a 0.</p>
        <Button onClick={handleStart}>Retake Quiz</Button>
      </div>
    );
  }

  if (status === "SUBMITTED" && !result) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
        <p className="text-sm font-medium">You already completed this quiz — scored {state?.score}%.</p>
        <Button onClick={handleStart}>Retake Quiz</Button>
      </div>
    );
  }

  if (status === "NOT_STARTED") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ListChecks className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">Ready to test what you learned?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {questions.length} question{questions.length === 1 ? "" : "s"}
            {typeof bestScore === "number" ? ` · Best score so far: ${bestScore}%` : ""}
          </p>
        </div>
        <Button onClick={handleStart} disabled={startQuiz.isPending}>
          Start Quiz
        </Button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-5">
        {questions.map((q, qIndex) => {
          const rowResult = result.results[qIndex];
          if (!rowResult) return null;
          return (
            <div key={qIndex} className="space-y-2">
              <p className="text-sm font-medium">
                {qIndex + 1}. {q.question}
              </p>
              <div className="space-y-1.5">
                {q.options.map((option, oIndex) => {
                  const isSelected = rowResult.selectedIndex === oIndex;
                  const isCorrectOption = oIndex === rowResult.correctIndex;
                  const isWrongSelected = isSelected && !rowResult.correct;

                  return (
                    <div
                      key={oIndex}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm",
                        isCorrectOption && "border-status-good bg-status-good/10",
                        isWrongSelected && "border-destructive bg-destructive/10",
                        !isCorrectOption && !isWrongSelected && "border-border opacity-60"
                      )}
                    >
                      {option}
                      {isCorrectOption && <CheckCircle2 className="h-4 w-4 text-status-good" />}
                      {isWrongSelected && <XCircle className="h-4 w-4 text-destructive" />}
                    </div>
                  );
                })}
              </div>
              {rowResult.explanation && (
                <p className="text-xs text-muted-foreground">{rowResult.explanation}</p>
              )}
            </div>
          );
        })}

        {!result.passed && (
          <p className="text-xs text-muted-foreground">
            Correct answers are shown once you pass the quiz.
          </p>
        )}

        <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 p-3">
          <p className="text-sm font-medium">
            You scored {result.score}% (best: {result.bestScore}%)
            {result.passed ? " — passed" : " — try again to pass"}
          </p>
          <Button variant="outline" size="sm" onClick={handleStart}>
            Retake quiz
          </Button>
        </div>
      </div>
    );
  }

  // IN_PROGRESS — render exactly what the server says the current question is.
  const currentIndex = state?.currentIndex ?? 0;
  const question = state?.question;
  const isLastQuestion = currentIndex === (state?.totalQuestions ?? 1) - 1;
  const busy = answerQuiz.isPending || submitQuiz.isPending;

  if (!question) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Question {currentIndex + 1} of {state?.totalQuestions}
        </p>
        {typeof bestScore === "number" && (
          <p className="text-xs text-muted-foreground">Best score so far: {bestScore}%</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">{question.question}</p>
        <div className="space-y-1.5">
          {question.options.map((option, oIndex) => (
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
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setQuitConfirmOpen(true)} disabled={busy}>
          Quit
        </Button>
        <Button onClick={handleNext} disabled={selected === null || busy}>
          {busy ? "Saving..." : isLastQuestion ? "Submit Quiz" : "Next"}
        </Button>
      </div>

      <ConfirmDialog
        open={quitConfirmOpen}
        onOpenChange={setQuitConfirmOpen}
        title="Quit this quiz?"
        description="Your attempt will be ended immediately and recorded as a 0 — this can't be undone."
        confirmLabel="Quit"
        destructive
        onConfirm={confirmQuit}
      />
    </div>
  );
}
