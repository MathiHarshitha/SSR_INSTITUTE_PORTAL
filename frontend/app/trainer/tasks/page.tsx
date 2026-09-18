"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, ClipboardCheck } from "lucide-react";
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

export default function TrainerTasksPage() {
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
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSubmissionsTask(task)}>
                              <ClipboardCheck className="h-4 w-4" />
                              View submissions
                            </DropdownMenuItem>
                            {task.status === "DRAFT" && (
                              <DropdownMenuItem
                                onClick={() => statusMutation.mutate({ id: task._id, status: "PUBLISHED" })}
                              >
                                Publish
                              </DropdownMenuItem>
                            )}
                            {task.status === "PUBLISHED" && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => statusMutation.mutate({ id: task._id, status: "CLOSED" })}
                              >
                                Close
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      <TaskSubmissionsDialog task={submissionsTask} onOpenChange={(open) => !open && setSubmissionsTask(null)} />
    </div>
  );
}
