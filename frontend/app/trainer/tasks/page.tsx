"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreHorizontal, Plus, ClipboardCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBatches } from "@/hooks/useBatches";
import { useCreateTask, useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import { TaskFormSheet } from "@/components/trainer/task-form-sheet";
import { TaskSubmissionsDialog } from "@/components/trainer/task-submissions-dialog";
import { TaskFormInput, TaskStatus, TrainerTask } from "@/types/task";

const STATUS_OPTIONS: TaskStatus[] = ["DRAFT", "PUBLISHED", "CLOSED"];

function statusBadgeClassName(status: TaskStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-status-good/10 text-status-good";
    case "CLOSED":
      return "bg-status-neutral/10 text-status-neutral";
    case "DRAFT":
      return "bg-muted text-muted-foreground";
  }
}

function TrainerTasksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusTaskId = searchParams.get("task");
  const focusSubmissionId = searchParams.get("submission");
  const { data: batchData } = useBatches({ page: 1, limit: 100 });
  const batches = batchData?.batches ?? [];

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const query = useMemo(
    () => ({ status: statusFilter !== "ALL" ? statusFilter : undefined }),
    [statusFilter]
  );

  const { data: tasks, isLoading, isError } = useTasks(query);
  const createMutation = useCreateTask();
  const statusMutation = useUpdateTaskStatus();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [submissionsTask, setSubmissionsTask] = useState<TrainerTask | null>(null);

  // Deep link from a "new submission" notification: ?task=<id>&submission=<id>. Handled once per
  // link, and re-handled when a different notification is clicked while already on this page.
  const [handledLink, setHandledLink] = useState<string | null>(null);
  const [linkMissing, setLinkMissing] = useState(false);
  const linkKey = focusTaskId ? `${focusTaskId}:${focusSubmissionId ?? ""}` : null;
  if (linkKey && tasks && handledLink !== linkKey) {
    const linked = tasks.find((t) => t._id === focusTaskId);
    if (linked) {
      setHandledLink(linkKey);
      setLinkMissing(false);
      setSubmissionsTask(linked);
    } else if (statusFilter !== "ALL") {
      setStatusFilter("ALL"); // the filter may be hiding it; look again once all tasks load
    } else {
      setHandledLink(linkKey);
      setLinkMissing(true);
    }
  }

  function openSubmissions(task: TrainerTask) {
    setSubmissionsTask(task);
  }

  function closeSubmissions() {
    setSubmissionsTask(null);
    // Drop the deep-link params so the same notification can be opened again later.
    if (focusTaskId) router.replace("/trainer/tasks");
  }

  function handleSubmit(input: TaskFormInput) {
    createMutation.mutate(input, { onSuccess: () => setSheetOpen(false) });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Create assignments, quizzes, and projects for your batches.
          </p>
        </div>
        <Button onClick={() => setSheetOpen(true)} disabled={batches.length === 0}>
          <Plus className="h-4 w-4" />
          Create task
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "ALL")}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {linkMissing && (
            <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              The task from that notification is no longer available.
            </p>
          )}

          {isError ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Failed to load tasks.</p>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !tasks || tasks.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No tasks created yet.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task._id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{task.submissionCount}</TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClassName(task.status)}>{task.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {task.status === "DRAFT" && (
                            <Button
                              size="sm"
                              disabled={statusMutation.isPending}
                              onClick={() => statusMutation.mutate({ id: task._id, status: "PUBLISHED" })}
                            >
                              <Send className="h-3.5 w-3.5" />
                              Publish
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => openSubmissions(task)}>
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            View submissions
                            {task.submissionCount > 0 && (
                              <Badge className="ml-0.5 h-5 min-w-5 justify-center rounded-full bg-secondary/10 px-1.5 text-secondary">
                                {task.submissionCount}
                              </Badge>
                            )}
                          </Button>
                          {task.status === "PUBLISHED" ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                                aria-label="More actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => statusMutation.mutate({ id: task._id, status: "CLOSED" })}
                                >
                                  Close task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            // Keeps the button column aligned across rows.
                            <span className="inline-block h-8 w-8" aria-hidden />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TaskFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        batches={batches}
        isSubmitting={createMutation.isPending}
        onSubmit={handleSubmit}
      />

      <TaskSubmissionsDialog
        task={submissionsTask}
        focusSubmissionId={submissionsTask?._id === focusTaskId ? focusSubmissionId : null}
        onOpenChange={(open) => !open && closeSubmissions()}
      />
    </div>
  );
}

// useSearchParams (for the ?task= deep link from submission notifications) needs a Suspense boundary.
export default function TrainerTasksPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <TrainerTasksContent />
    </Suspense>
  );
}
