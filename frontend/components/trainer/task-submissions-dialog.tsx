"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { cn } from "cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEvaluateSubmission, useTaskSubmissions } from "@/hooks/useTasks";
import { SubmissionRow, TrainerTask } from "@/types/task";
import { SubmissionViewDialog } from "@/components/trainer/submission-view-dialog";

function statusBadgeClassName(status: SubmissionRow["status"]): string {
  switch (status) {
    case "EVALUATED":
      return "bg-status-good/10 text-status-good";
    case "LATE":
      return "bg-status-serious/15 text-orange-800 dark:text-status-serious";
    case "SUBMITTED":
      return "bg-secondary/10 text-secondary";
    case "DRAFT":
      return "bg-muted text-muted-foreground";
  }
}

interface TaskSubmissionsDialogProps {
  task: TrainerTask | null;
  onOpenChange: (open: boolean) => void;
  /** Submission to highlight and open straight away (deep link from a notification). */
  focusSubmissionId?: string | null;
}

export function TaskSubmissionsDialog({ task, onOpenChange, focusSubmissionId }: TaskSubmissionsDialogProps) {
  const { data: submissions, isLoading, isFetching, isError } = useTaskSubmissions(task?._id ?? null);
  const evaluateMutation = useEvaluateSubmission(task?._id ?? "");
  const [drafts, setDrafts] = useState<Record<string, { marks: string; feedback: string }>>({});
  const [viewing, setViewing] = useState<SubmissionRow | null>(null);

  // Open the focused submission once fresh data has loaded (once per focus id). Waiting for the
  // fetch to settle matters: cached data from before the submission arrived wouldn't contain it.
  const [autoOpenedFor, setAutoOpenedFor] = useState<string | null>(null);
  if (focusSubmissionId && submissions && !isFetching && autoOpenedFor !== focusSubmissionId) {
    setAutoOpenedFor(focusSubmissionId);
    const focused = submissions.find((s) => s._id === focusSubmissionId);
    if (focused) setViewing(focused);
  }

  function getDraft(sub: SubmissionRow) {
    return drafts[sub._id] ?? { marks: sub.marks?.toString() ?? "", feedback: sub.feedback ?? "" };
  }

  return (
    <Dialog open={!!task} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task?.title} — Submissions</DialogTitle>
          <DialogDescription>Max marks: {task?.maxMarks}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : isError ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Failed to load submissions.</p>
        ) : !submissions || submissions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => {
                  const draft = getDraft(sub);
                  return (
                    <TableRow
                      key={sub._id}
                      className={cn(sub._id === focusSubmissionId && "bg-secondary/10 hover:bg-secondary/15")}
                    >
                      <TableCell>
                        <p className="font-medium">{sub.student.name}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-1"
                          onClick={() => setViewing(sub)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Submission
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClassName(sub.status)}>{sub.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          className="w-20"
                          value={draft.marks}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [sub._id]: { ...draft, marks: e.target.value },
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="w-40"
                          placeholder="Feedback"
                          value={draft.feedback}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [sub._id]: { ...draft, feedback: e.target.value },
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          disabled={!draft.marks || evaluateMutation.isPending}
                          onClick={() =>
                            evaluateMutation.mutate({
                              submissionId: sub._id,
                              marks: Number(draft.marks),
                              feedback: draft.feedback || undefined,
                            })
                          }
                        >
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <SubmissionViewDialog
          submission={viewing}
          taskTitle={task?.title}
          maxMarks={task?.maxMarks}
          onOpenChange={(open) => !open && setViewing(null)}
        />
      </DialogContent>
    </Dialog>
  );
}
