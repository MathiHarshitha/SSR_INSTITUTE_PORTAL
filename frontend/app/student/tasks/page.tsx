"use client";

import { useMemo, useState } from "react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import {
  ClipboardList,
  CheckCircle2,
  AlarmClock,
  ListChecks,
  FileText,
  HelpCircle,
  FolderKanban,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import { useStudentTasks } from "@/hooks/useTasks";
import { SubmitTaskDialog } from "@/components/student/submit-task-dialog";
import { StudentTask } from "@/types/task";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageBanner } from "@/components/shared/page-banner";
import { MiniCalendar, CalendarMark } from "@/components/shared/mini-calendar";

type FilterKey = "all" | "pending" | "completed" | "overdue" | "ASSIGNMENT" | "QUIZ" | "PROJECT";

const TYPE_ICON = { ASSIGNMENT: FileText, QUIZ: HelpCircle, PROJECT: FolderKanban } as const;

function dueLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return `Tomorrow`;
  return format(date, "MMM d, yyyy");
}

export default function StudentTasksPage() {
  const { data: tasks, isLoading, isError } = useStudentTasks({});
  const [activeTask, setActiveTask] = useState<StudentTask | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  const all = tasks ?? [];

  const pending = all.filter((t) => !t.mySubmission && !isPast(new Date(t.dueDate)));
  const completed = all.filter((t) => t.mySubmission?.status === "EVALUATED" || t.mySubmission?.status === "SUBMITTED");
  const overdue = all.filter((t) => !t.mySubmission && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)));

  const filtered = useMemo(() => {
    switch (filter) {
      case "pending":
        return pending;
      case "completed":
        return completed;
      case "overdue":
        return overdue;
      case "ASSIGNMENT":
      case "QUIZ":
      case "PROJECT":
        return all.filter((t) => t.type === filter);
      default:
        return all;
    }
  }, [filter, all, pending, completed, overdue]);

  const upcoming = [...all]
    .filter((t) => !t.mySubmission)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const marks: CalendarMark[] = all.map((t) => ({
    date: format(new Date(t.dueDate), "yyyy-MM-dd"),
    className: t.mySubmission ? "bg-status-good" : isPast(new Date(t.dueDate)) ? "bg-status-critical" : "bg-secondary",
  }));

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: `All Tasks (${all.length})` },
    { key: "pending", label: `Pending (${pending.length})` },
    { key: "completed", label: `Completed (${completed.length})` },
    { key: "overdue", label: `Overdue (${overdue.length})` },
    { key: "ASSIGNMENT", label: `Assignments (${all.filter((t) => t.type === "ASSIGNMENT").length})` },
    { key: "QUIZ", label: `Quizzes (${all.filter((t) => t.type === "QUIZ").length})` },
    { key: "PROJECT", label: `Projects (${all.filter((t) => t.type === "PROJECT").length})` },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Stay on Track"
        eyebrowIcon={ClipboardList}
        title="Tasks"
        subtitle="Complete your assignments, quizzes, and projects before the deadline."
        quote="Discipline turns goals into results."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pending" value={pending.length} icon={ListChecks} color="accent" />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} color="green" />
        <StatCard label="Overdue" value={overdue.length} icon={AlarmClock} color="critical" />
        <StatCard label="Total Tasks" value={all.length} icon={Flag} color="primary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === f.key
                    ? "bg-secondary text-secondary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="clay">
            {isError ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Failed to load tasks.</p>
            ) : isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No tasks in this view.</p>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((task) => {
                  const due = new Date(task.dueDate);
                  const status = task.mySubmission?.status ?? "NOT_SUBMITTED";
                  const isDone = status === "SUBMITTED" || status === "EVALUATED";
                  const isOverdue = !task.mySubmission && isPast(due) && !isToday(due);
                  const Icon = TYPE_ICON[task.type];
                  return (
                    <li key={task._id} className="flex items-center gap-3 p-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                          isDone ? "bg-status-good/10 text-status-good" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{task.type}</p>
                      </div>
                      <div className="hidden shrink-0 text-right sm:block">
                        <p className={cn("text-xs font-medium", isOverdue ? "text-status-critical" : "text-foreground")}>
                          {dueLabel(due)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          isDone
                            ? "bg-status-good/10 text-status-good"
                            : isOverdue
                              ? "bg-status-critical/10 text-status-critical"
                              : "bg-secondary/10 text-secondary"
                        )}
                      >
                        {isDone ? (status === "EVALUATED" && task.mySubmission?.marks !== undefined ? `${task.mySubmission.marks}/${task.maxMarks}` : status) : isOverdue ? "Overdue" : "Pending"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={task.status === "CLOSED" && !task.mySubmission}
                        onClick={() => setActiveTask(task)}
                      >
                        {isDone ? "View" : "Submit"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="clay p-4">
            <MiniCalendar
              marks={marks}
              legend={[
                { label: "Submitted", className: "bg-status-good" },
                { label: "Pending", className: "bg-secondary" },
                { label: "Overdue", className: "bg-status-critical" },
              ]}
            />
          </div>

          <div className="clay p-4">
            <p className="mb-2 text-sm font-semibold text-foreground">Upcoming Deadlines</p>
            {upcoming.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nothing due — you&apos;re all caught up!</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((t) => (
                  <li key={t._id} className="flex items-center justify-between gap-2 rounded-xl border border-border p-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">{t.title}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {dueLabel(new Date(t.dueDate))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <PageBanner
        icon={Flag}
        title="Consistent action creates real progress."
        subtitle="You're closer than you think."
        tone="dark"
      />

      <SubmitTaskDialog task={activeTask} onOpenChange={(open) => !open && setActiveTask(null)} />
    </div>
  );
}
