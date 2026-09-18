"use client";

import { useState } from "react";
import { Users } from "lucide-react";
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
import { useBatches } from "@/hooks/useBatches";
import { BatchRosterViewDialog } from "@/components/trainer/batch-roster-view-dialog";
import { AdminBatch, BatchStatus } from "@/types/batch";

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

export default function TrainerBatchesPage() {
  const { data, isLoading, isError } = useBatches({ page: 1, limit: 100 });
  const [rosterBatch, setRosterBatch] = useState<AdminBatch | null>(null);
  const batches = data?.batches ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">My Batches</h2>
        <p className="text-sm text-muted-foreground">Batches assigned to you.</p>
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Failed to load batches.</p>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : batches.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No batches assigned to you yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch._id}>
                      <TableCell className="font-medium">{batch.name}</TableCell>
                      <TableCell className="text-muted-foreground">{batch.course.name}</TableCell>
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
                        <Button variant="outline" size="sm" onClick={() => setRosterBatch(batch)}>
                          <Users className="h-3.5 w-3.5" />
                          Students
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BatchRosterViewDialog batch={rosterBatch} onOpenChange={(open) => !open && setRosterBatch(null)} />
    </div>
  );
}
