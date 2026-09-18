"use client";

import { useState } from "react";
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
}

export function TaskSubmissionsDialog({ task, onOpenChange }: TaskSubmissionsDialogProps) {
  const { data: submissions, isLoading } = useTaskSubmissions(task?._id ?? null);
  const evaluateMutation = useEvaluateSubmission(task?._id ?? "");
  const [drafts, setDrafts] = useState<Record<string, { marks: string; feedback: string }>>({});

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
                    <TableRow key={sub._id}>
                      <TableCell>
                        <p className="font-medium">{sub.student.name}</p>
                        {sub.fileUrl && (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View submission
                          </a>
                        )}
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
      </DialogContent>
    </Dialog>
  );
}
