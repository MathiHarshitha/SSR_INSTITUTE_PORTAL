"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Code2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import { useCodingState, useSubmitCoding } from "@/hooks/useLesson";
import { CodingSubmitResult, StudentCodingQuestion } from "@/types/module";

interface CodingQuestionProps {
  lessonId: string;
  question: StudentCodingQuestion;
  completed: boolean;
}

/** Code runs sandboxed server-side (Node `vm`, no I/O, hard timeout) against hidden test
 * cases — this panel never sees expected outputs, only pass/fail per case after submitting. */
export function CodingQuestion({ lessonId, question, completed }: CodingQuestionProps) {
  const { data: state, isLoading } = useCodingState(lessonId);
  const submitCoding = useSubmitCoding(lessonId);
  const [code, setCode] = useState(question.starterCode);
  const [result, setResult] = useState<CodingSubmitResult | null>(null);

  useEffect(() => {
    if (state?.lastSubmission) setCode(state.lastSubmission.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.lastSubmission?.code]);

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  async function handleSubmit() {
    const graded = await submitCoding.mutateAsync(code);
    setResult(graded);
  }

  const display = result ?? state?.lastSubmission ?? null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Code2 className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium">Write a function named `{question.functionName}`</p>
        {completed && <CheckCircle2 className="h-4 w-4 text-status-good" />}
      </div>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{question.prompt}</p>

      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={10}
        className="font-mono text-xs"
        spellCheck={false}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Runs against hidden test cases in a sandboxed environment.
        </p>
        <Button onClick={handleSubmit} disabled={submitCoding.isPending || !code.trim()}>
          {submitCoding.isPending ? "Running..." : "Run & Submit"}
        </Button>
      </div>

      {display && (
        <div className="space-y-2 rounded-md border border-border p-3">
          <p
            className={cn(
              "text-sm font-medium",
              display.passed ? "text-status-good" : "text-destructive"
            )}
          >
            {display.passed ? "All test cases passed" : "Some test cases failed"}
          </p>
          <ul className="space-y-1.5">
            {display.testResults.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                {r.passed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-status-good" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                )}
                <span className="text-muted-foreground">
                  Test case {i + 1}
                  {r.error ? `: ${r.error}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
