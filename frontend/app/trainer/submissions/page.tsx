"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { usePendingSubmissions } from "@/hooks/useTasks";
import { taskService } from "@/services/task.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/api-client";
import { PendingSubmissionRow, SubmissionStatus } from "@/types/task";

function statusBadgeClassName(status: SubmissionStatus): string {
  switch (status) {
    case "LATE":
      return "bg-status-serious/15 text-orange-800 dark:text-status-serious";
    case "SUBMITTED":
      return "bg-secondary/10 text-secondary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function TrainerSubmissionsPage() {
  const { data: submissions, isLoading, isError } = usePendingSubmissions();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, { marks: string; feedback: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  function getDraft(sub: PendingSubmissionRow) {
    return drafts[sub._id] ?? { marks: "", feedback: "" };
  }

  async function handleEvaluate(sub: PendingSubmissionRow) {
    const draft = getDraft(sub);
    if (!draft.marks) return;
    setSavingId(sub._id);
    try {
      await taskService.evaluateSubmission(sub._id, Number(draft.marks), draft.feedback || undefined);
      toast.success("Submission evaluated");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Submissions</h2>
        <p className="text-sm text-muted-foreground">
          Pending submissions across all your batches, oldest first.
        </p>
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Failed to load submissions.
            </p>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No pending submissions. You&apos;re all caught up.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Batch</TableHead>
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
                        <TableCell className="text-muted-foreground">
                          {sub.task.title}
                          <span className="ml-1 text-xs">(max {sub.task.maxMarks})</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{sub.batch.name}</TableCell>
                        <TableCell>
                          <Badge className={statusBadgeClassName(sub.status)}>{sub.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={sub.task.maxMarks}
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
                            placeholder="Optional"
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
                            disabled={!draft.marks || savingId === sub._id}
                            onClick={() => handleEvaluate(sub)}
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
        </CardContent>
      </Card>
    </div>
  );
}
