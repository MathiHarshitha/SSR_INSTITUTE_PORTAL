"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStudentTasks } from "@/hooks/useTasks";
import { SubmitTaskDialog } from "@/components/student/submit-task-dialog";
import { StudentTask, SubmissionStatus } from "@/types/task";

function statusBadgeClassName(status: SubmissionStatus | "NOT_SUBMITTED"): string {
  switch (status) {
    case "EVALUATED":
      return "bg-status-good/10 text-status-good";
    case "LATE":
      return "bg-status-serious/15 text-orange-800 dark:text-status-serious";
    case "SUBMITTED":
      return "bg-secondary/10 text-secondary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function StudentTasksPage() {
  const { data: tasks, isLoading, isError } = useStudentTasks({});
  const [activeTask, setActiveTask] = useState<StudentTask | null>(null);

  const now = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Tasks</h2>
        <p className="text-sm text-muted-foreground">
          View assignments, quizzes, and projects, and submit your work before the deadline.
        </p>
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Failed to load tasks.</p>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !tasks || tasks.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No tasks published yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => {
                    const isPastDue = new Date(task.dueDate) < now;
                    const status = task.mySubmission?.status ?? "NOT_SUBMITTED";
                    return (
                      <TableRow key={task._id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.type}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadgeClassName(status)}>
                            {status === "NOT_SUBMITTED"
                              ? isPastDue
                                ? "Missed"
                                : "Not submitted"
                              : task.mySubmission?.marks !== undefined && status === "EVALUATED"
                                ? `${task.mySubmission.marks}/${task.maxMarks}`
                                : status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={task.status === "CLOSED" && !task.mySubmission}
                            onClick={() => setActiveTask(task)}
                          >
                            {status === "NOT_SUBMITTED" ? "Submit" : "View"}
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

      <SubmitTaskDialog task={activeTask} onOpenChange={(open) => !open && setActiveTask(null)} />
    </div>
  );
}
