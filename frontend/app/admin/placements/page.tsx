"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Plus, Pencil, Users } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCreateJob, useJobs, useUpdateJob, useUpdateJobStatus } from "@/hooks/useJobs";
import { JobFormSheet } from "@/components/admin/job-form-sheet";
import { JobApplicationsDialog } from "@/components/admin/job-applications-dialog";
import { AdminJob, JobFormInput, JobStatus } from "@/types/job";

const STATUS_OPTIONS: JobStatus[] = ["DRAFT", "PUBLISHED", "CLOSED"];

function statusBadgeClassName(status: JobStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-status-good/10 text-status-good";
    case "CLOSED":
      return "bg-status-neutral/10 text-status-neutral";
    case "DRAFT":
      return "bg-muted text-muted-foreground";
  }
}

export default function AdminPlacementsPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [status, setStatus] = useState<JobStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<AdminJob | null>(null);
  const [applicationsJob, setApplicationsJob] = useState<AdminJob | null>(null);

  const query = useMemo(
    () => ({ page, limit, search: search || undefined, status: status !== "ALL" ? status : undefined }),
    [page, search, status]
  );

  const { data, isLoading, isError, isFetching } = useJobs(query);
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();
  const statusMutation = useUpdateJobStatus();

  const jobs = data?.jobs ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  function openCreate() {
    setEditingJob(null);
    setSheetOpen(true);
  }

  function openEdit(job: AdminJob) {
    setEditingJob(job);
    setSheetOpen(true);
  }

  function handleSubmit(input: JobFormInput) {
    if (editingJob) {
      updateMutation.mutate({ id: editingJob._id, input }, { onSuccess: () => setSheetOpen(false) });
    } else {
      createMutation.mutate(input, { onSuccess: () => setSheetOpen(false) });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Placements</h2>
          <p className="text-sm text-muted-foreground">
            Post jobs and track applications through to selection.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Post a job
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title or company..."
                className="pl-8"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as JobStatus | "ALL");
                setPage(1);
              }}
            >
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
          </div>

          {isError ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Failed to load jobs.</p>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No jobs posted yet. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job._id} className={cn(isFetching && "opacity-60")}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell className="text-muted-foreground">{job.company}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(job.applicationDeadline).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{job.applicationCount}</TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClassName(job.status)}>{job.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setApplicationsJob(job)}>
                              <Users className="h-4 w-4" />
                              View applications
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(job)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {job.status !== "PUBLISHED" && (
                              <DropdownMenuItem
                                onClick={() => statusMutation.mutate({ id: job._id, status: "PUBLISHED" })}
                              >
                                Publish
                              </DropdownMenuItem>
                            )}
                            {job.status !== "CLOSED" && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => statusMutation.mutate({ id: job._id, status: "CLOSED" })}
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

          {!isLoading && !isError && jobs.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <JobFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        job={editingJob}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <JobApplicationsDialog
        job={applicationsJob}
        onOpenChange={(open) => !open && setApplicationsJob(null)}
      />
    </div>
  );
}
