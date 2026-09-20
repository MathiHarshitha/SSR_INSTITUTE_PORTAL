"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { useSubmitQuiz } from "@/hooks/useLesson";
import { StudentQuizQuestion, QuizSubmitResult } from "@/types/module";

interface LessonQuizProps {
  lessonId: string;
  questions: StudentQuizQuestion[];
  bestScore?: number;
}

export function LessonQuiz({ lessonId, questions, bestScore }: LessonQuizProps) {
  const [selected, setSelected] = useState<(number | null)[]>(questions.map(() => null));
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const submitQuiz = useSubmitQuiz(lessonId);

  const allAnswered = selected.every((s) => s !== null);

  function selectOption(questionIndex: number, optionIndex: number) {
    if (result) return;
    setSelected((prev) => prev.map((v, i) => (i === questionIndex ? optionIndex : v)));
  }

  function handleSubmit() {
    submitQuiz.mutate(selected.map((s) => s ?? -1), {
      onSuccess: (data) => setResult(data),
    });
  }

  function retake() {
    setResult(null);
    setSelected(questions.map(() => null));
  }

  return (
    <div className="space-y-5">
      {typeof bestScore === "number" && !result && (
        <p className="text-sm text-muted-foreground">Your best score so far: {bestScore}%</p>
      )}

      {questions.map((q, qIndex) => {
        const rowResult = result?.results[qIndex];
        return (
          <div key={qIndex} className="space-y-2">
            <p className="text-sm font-medium">
              {qIndex + 1}. {q.question}
            </p>
            <div className="space-y-1.5">
              {q.options.map((option, oIndex) => {
                const isSelected = selected[qIndex] === oIndex;
                const isCorrectOption = rowResult && oIndex === rowResult.correctIndex;
                const isWrongSelected = rowResult && isSelected && !rowResult.correct;

                return (
                  <button
                    key={oIndex}
                    type="button"
                    disabled={!!result}
                    onClick={() => selectOption(qIndex, oIndex)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      isSelected && !result && "border-primary bg-primary/5",
                      !isSelected && !result && "border-border hover:bg-muted",
                      result && isCorrectOption && "border-status-good bg-status-good/10",
                      result && isWrongSelected && "border-destructive bg-destructive/10",
                      result && !isCorrectOption && !isWrongSelected && "border-border opacity-60"
                    )}
                  >
                    {option}
                    {result && isCorrectOption && <CheckCircle2 className="h-4 w-4 text-status-good" />}
                    {result && isWrongSelected && <XCircle className="h-4 w-4 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {rowResult?.explanation && (
              <p className="text-xs text-muted-foreground">{rowResult.explanation}</p>
            )}
          </div>
        );
      })}

      {result ? (
        <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 p-3">
          <p className="text-sm font-medium">
            You scored {result.score}% (best: {result.bestScore}%)
          </p>
          <Button variant="outline" size="sm" onClick={retake}>
            Retake quiz
          </Button>
        </div>
      ) : (
        <Button onClick={handleSubmit} disabled={!allAnswered || submitQuiz.isPending}>
          {submitQuiz.isPending ? "Submitting..." : "Submit Quiz"}
        </Button>
      )}
    </div>
  );
}
