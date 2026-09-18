"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useAttendance, useAttendanceSummary } from "@/hooks/useAttendance";
import { AttendanceStatus } from "@/types/attendance";

function statusBadgeClassName(status: AttendanceStatus): string {
  switch (status) {
    case "PRESENT":
      return "bg-status-good/10 text-status-good";
    case "LATE":
      return "bg-status-serious/15 text-orange-800 dark:text-status-serious";
    case "LEAVE":
      return "bg-secondary/10 text-secondary";
    case "ABSENT":
      return "bg-status-critical/10 text-status-critical";
  }
}

export default function StudentAttendancePage() {
  const { data: dashboard } = useStudentDashboard();
  const batchId = dashboard?.enrollment?.batch._id ?? "";

  const { data: records, isLoading } = useAttendance(batchId);
  const { data: summary } = useAttendanceSummary(batchId || null);
  const mySummary = summary?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Attendance</h2>
        <p className="text-sm text-muted-foreground">Your attendance history for this course.</p>
      </div>

      {mySummary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: "Overall %", value: `${mySummary.percentage}%` },
            { label: "Present", value: mySummary.present },
            { label: "Absent", value: mySummary.absent },
            { label: "Late", value: mySummary.late },
            { label: "Leave", value: mySummary.leave },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold text-foreground">{stat.value}</CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent>
          {!batchId ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              You are not enrolled in a batch yet.
            </p>
          ) : isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !records || records.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No attendance recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(r.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClassName(r.status)}>{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
