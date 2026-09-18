"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Plus, Pencil } from "lucide-react";
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
import { useAdminCourses, useCreateCourse, useUpdateCourse, useUpdateCourseStatus } from "@/hooks/useCourses";
import { CourseFormSheet } from "@/components/admin/course-form-sheet";
import { AdminCourse, CourseFormInput, CourseStatus } from "@/types/course";

const STATUS_OPTIONS: CourseStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function statusBadgeClassName(status: CourseStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-status-good/10 text-status-good";
    case "ARCHIVED":
      return "bg-status-neutral/10 text-status-neutral";
    case "DRAFT":
      return "bg-muted text-muted-foreground";
  }
}

export default function AdminCoursesPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [status, setStatus] = useState<CourseStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);

  const query = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: status !== "ALL" ? status : undefined,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    }),
    [page, search, status]
  );

  const { data, isLoading, isError, isFetching } = useAdminCourses(query);
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const statusMutation = useUpdateCourseStatus();

  const courses = data?.courses ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  function openCreate() {
    setEditingCourse(null);
    setSheetOpen(true);
  }

  function openEdit(course: AdminCourse) {
    setEditingCourse(course);
    setSheetOpen(true);
  }

  function handleSubmit(input: CourseFormInput) {
    if (editingCourse) {
      updateMutation.mutate(
        { id: editingCourse._id, input },
        { onSuccess: () => setSheetOpen(false) }
      );
    } else {
      createMutation.mutate(input, { onSuccess: () => setSheetOpen(false) });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Courses</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage courses. New courses start as drafts until published.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Create course
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or category..."
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
                setStatus(value as CourseStatus | "ALL");
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
              <p className="text-sm text-muted-foreground">Failed to load courses.</p>
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
          ) : courses.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No courses found. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course._id} className={cn(isFetching && "opacity-60")}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell className="text-muted-foreground">{course.category || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{course.duration}</TableCell>
                      <TableCell className="text-muted-foreground">
                        ₹{course.fee.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClassName(course.status)}>{course.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(course)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {course.status !== "PUBLISHED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  statusMutation.mutate({ id: course._id, status: "PUBLISHED" })
                                }
                              >
                                Publish
                              </DropdownMenuItem>
                            )}
                            {course.status !== "DRAFT" && (
                              <DropdownMenuItem
                                onClick={() => statusMutation.mutate({ id: course._id, status: "DRAFT" })}
                              >
                                Move to draft
                              </DropdownMenuItem>
                            )}
                            {course.status !== "ARCHIVED" && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  statusMutation.mutate({ id: course._id, status: "ARCHIVED" })
                                }
                              >
                                Archive
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

          {!isLoading && !isError && courses.length > 0 && (
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

      <CourseFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        course={editingCourse}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
