"use client";

import { useState } from "react";
import { Search, UserMinus, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useActiveStudents } from "@/hooks/useUsers";
import { useBatchStudents, useEnrollStudent, useRemoveStudent } from "@/hooks/useBatches";
import { AdminBatch } from "@/types/batch";

interface BatchRosterDialogProps {
  batch: AdminBatch | null;
  onOpenChange: (open: boolean) => void;
}

export function BatchRosterDialog({ batch, onOpenChange }: BatchRosterDialogProps) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);

  const { data: students, isLoading } = useBatchStudents(batch?._id ?? null);
  const { data: candidateData } = useActiveStudents(search || undefined);
  const enrollMutation = useEnrollStudent(batch?._id ?? "");
  const removeMutation = useRemoveStudent(batch?._id ?? "");

  const enrolledIds = new Set((students ?? []).map((s) => s.student._id));
  const candidates = (candidateData?.users ?? []).filter((u) => !enrolledIds.has(u._id));

  return (
    <Dialog open={!!batch} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{batch?.name} — Students</DialogTitle>
          <DialogDescription>
            {batch ? `${students?.length ?? 0} of ${batch.capacity} seats filled.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search active students to enroll..."
              className="pl-8"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {searchInput && (
            <div className="max-h-40 overflow-y-auto rounded-md border border-border">
              {candidates.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">No matching active students.</p>
              ) : (
                candidates.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between border-b border-border px-3 py-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={enrollMutation.isPending}
                      onClick={() => enrollMutation.mutate(student._id)}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Enroll
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !students || students.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No students enrolled yet.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((enrollment) => (
                    <TableRow key={enrollment.enrollmentId}>
                      <TableCell>
                        <p className="font-medium">{enrollment.student.name}</p>
                        <p className="text-xs text-muted-foreground">{enrollment.student.email}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={removeMutation.isPending}
                          onClick={() => removeMutation.mutate(enrollment.student._id)}
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
