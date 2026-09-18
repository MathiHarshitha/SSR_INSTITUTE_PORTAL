"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBatchStudents } from "@/hooks/useBatches";
import { useAttendanceSummary } from "@/hooks/useAttendance";
import { AdminBatch } from "@/types/batch";

interface BatchRosterViewDialogProps {
  batch: AdminBatch | null;
  onOpenChange: (open: boolean) => void;
}

export function BatchRosterViewDialog({ batch, onOpenChange }: BatchRosterViewDialogProps) {
  const { data: students, isLoading } = useBatchStudents(batch?._id ?? null);
  const { data: summary } = useAttendanceSummary(batch?._id ?? null);

  const summaryMap = new Map((summary ?? []).map((s) => [s.student, s.percentage]));

  return (
    <Dialog open={!!batch} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{batch?.name} — Students</DialogTitle>
          <DialogDescription>
            {students?.length ?? 0} of {batch?.capacity} seats filled.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !students || students.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No students enrolled yet.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((enrollment) => (
                  <TableRow key={enrollment.enrollmentId}>
                    <TableCell>
                      <p className="font-medium">{enrollment.student.name}</p>
                      <p className="text-xs text-muted-foreground">{enrollment.student.email}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {summaryMap.has(enrollment.student._id)
                        ? `${summaryMap.get(enrollment.student._id)}%`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
