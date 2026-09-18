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
import { useBatches, useCreateBatch, useUpdateBatch, useUpdateBatchStatus } from "@/hooks/useBatches";
import { BatchFormSheet } from "@/components/admin/batch-form-sheet";
import { BatchRosterDialog } from "@/components/admin/batch-roster-dialog";
import { AdminBatch, BatchFormInput, BatchStatus } from "@/types/batch";

const STATUS_OPTIONS: BatchStatus[] = ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"];

function statusBadgeClassName(status: BatchStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-status-good/10 text-status-good";
    case "UPCOMING":
      return "bg-secondary/10 text-secondary";
    case "COMPLETED":
      return "bg-status-neutral/10 text-status-neutral";
    case "CANCELLED":
      return "bg-status-critical/10 text-status-critical";
  }
}

export default function AdminBatchesPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [status, setStatus] = useState<BatchStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<AdminBatch | null>(null);
  const [rosterBatch, setRosterBatch] = useState<AdminBatch | null>(null);

  const query = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: status !== "ALL" ? status : undefined,
      sortBy: "startDate" as const,
      sortOrder: "desc" as const,
    }),
    [page, search, status]
  );

  const { data, isLoading, isError, isFetching } = useBatches(query);
  const createMutation = useCreateBatch();
  const updateMutation = useUpdateBatch();
  const statusMutation = useUpdateBatchStatus();

  const batches = data?.batches ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  function openCreate() {
    setEditingBatch(null);
    setSheetOpen(true);
  }

  function openEdit(batch: AdminBatch) {
    setEditingBatch(batch);
    setSheetOpen(true);
  }

  function handleSubmit(input: BatchFormInput) {
    if (editingBatch) {
      updateMutation.mutate({ id: editingBatch._id, input }, { onSuccess: () => setSheetOpen(false) });
    } else {
      createMutation.mutate(input, { onSuccess: () => setSheetOpen(false) });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Batches</h2>
          <p className="text-sm text-muted-foreground">
            Schedule batches, assign trainers, and manage student rosters.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Create batch
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by batch name..."
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
              onValueChange={(value) => {
                setStatus(value as BatchStatus | "ALL");
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
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">Failed to load batches.</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : batches.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No batches found. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch._id} className={cn(isFetching && "opacity-60")}>
                      <TableCell className="font-medium">{batch.name}</TableCell>
                      <TableCell className="text-muted-foreground">{batch.course.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {batch.trainer?.name ?? "Unassigned"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div>{new Date(batch.startDate).toLocaleDateString()}</div>
                        <div className="text-xs">
                          {batch.classDays.join(", ")} · {batch.startTime}-{batch.endTime}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {batch.enrolledCount}/{batch.capacity}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClassName(batch.status)}>{batch.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setRosterBatch(batch)}>
                              <Users className="h-4 w-4" />
                              Manage students
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(batch)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {STATUS_OPTIONS.filter((s) => s !== batch.status).map((s) => (
                              <DropdownMenuItem
                                key={s}
                                variant={s === "CANCELLED" ? "destructive" : "default"}
                                onClick={() => statusMutation.mutate({ id: batch._id, status: s })}
                              >
                                Mark as {s.toLowerCase()}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && !isError && batches.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BatchFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        batch={editingBatch}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <BatchRosterDialog batch={rosterBatch} onOpenChange={(open) => !open && setRosterBatch(null)} />
    </div>
  );
}
