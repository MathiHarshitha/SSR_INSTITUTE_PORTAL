"use client";

import { useState } from "react";
import { CheckCircle2, ListChecks, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "cn";
import { useSubmitQuiz } from "@/hooks/useLesson";
import { StudentQuizQuestion, QuizSubmitResult } from "@/types/module";

interface LessonQuizProps {
  lessonId: string;
  questions: StudentQuizQuestion[];
  bestScore?: number;
  /** Notified whenever the quiz enters or leaves its active (questions/result) phase, so the
   * parent page can hide the topic explanation while the quiz is in progress. */
  onActiveChange?: (active: boolean) => void;
}

/** Explanation is shown by the parent page first; the quiz itself stays collapsed behind a
 * "Start Quiz" gate until the student is ready. Once started, one question at a time: the
 * student answers, clicks Next to reveal the next question (no auto-advance on select, no going
 * back), and can Quit at any point to abandon the attempt. */
export function LessonQuiz({ lessonId, questions, bestScore, onActiveChange }: LessonQuizProps) {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<(number | null)[]>(questions.map(() => null));
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [quitConfirmOpen, setQuitConfirmOpen] = useState(false);
  const submitQuiz = useSubmitQuiz(lessonId);

  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswered = selected[currentIndex] !== null;

  function startQuiz() {
    setStarted(true);
    onActiveChange?.(true);
  }

  function selectOption(optionIndex: number) {
    setSelected((prev) => prev.map((v, i) => (i === currentIndex ? optionIndex : v)));
  }

  function handleNext() {
    if (isLastQuestion) {
      submitQuiz.mutate(selected.map((s) => s ?? -1), {
        onSuccess: (data) => setResult(data),
      });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function reset() {
    setResult(null);
    setSelected(questions.map(() => null));
    setCurrentIndex(0);
    setStarted(false);
    onActiveChange?.(false);
  }

  function confirmQuit() {
    setQuitConfirmOpen(false);
    reset();
  }

  if (!started && !result) {
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
        <Button onClick={startQuiz}>Start Quiz</Button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-5">
        {questions.map((q, qIndex) => {
          const rowResult = result.results[qIndex];
          return (
            <div key={qIndex} className="space-y-2">
              <p className="text-sm font-medium">
                {qIndex + 1}. {q.question}
              </p>
              <div className="space-y-1.5">
                {q.options.map((option, oIndex) => {
                  const isSelected = selected[qIndex] === oIndex;
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

        <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 p-3">
          <p className="text-sm font-medium">
            You scored {result.score}% (best: {result.bestScore}%)
          </p>
          <Button variant="outline" size="sm" onClick={reset}>
            Retake quiz
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </p>
        {typeof bestScore === "number" && (
          <p className="text-xs text-muted-foreground">Best score so far: {bestScore}%</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">{question.question}</p>
        <div className="space-y-1.5">
          {question.options.map((option, oIndex) => {
            const isSelected = selected[currentIndex] === oIndex;
            return (
              <button
                key={oIndex}
                type="button"
                onClick={() => selectOption(oIndex)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border hover:bg-muted/60"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setQuitConfirmOpen(true)}>
          Quit
        </Button>
        <Button onClick={handleNext} disabled={!currentAnswered || submitQuiz.isPending}>
          {submitQuiz.isPending ? "Submitting..." : isLastQuestion ? "Submit Quiz" : "Next"}
        </Button>
      </div>

      <ConfirmDialog
        open={quitConfirmOpen}
        onOpenChange={setQuitConfirmOpen}
        title="Quit this quiz?"
        description="Your answers so far will be discarded and the attempt won't be submitted."
        confirmLabel="Quit"
        destructive
        onConfirm={confirmQuit}
      />
    </div>
  );
}
