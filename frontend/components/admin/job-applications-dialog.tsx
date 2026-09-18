"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
import { useJobApplications, useUpdateApplicationStatus } from "@/hooks/useJobs";
import { AdminJob, ApplicationStatus } from "@/types/job";

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
];

function statusBadgeClassName(status: ApplicationStatus): string {
  switch (status) {
    case "SELECTED":
      return "bg-status-good/10 text-status-good";
    case "REJECTED":
    case "WITHDRAWN":
      return "bg-status-critical/10 text-status-critical";
    case "SHORTLISTED":
    case "INTERVIEW_SCHEDULED":
      return "bg-secondary/10 text-secondary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

interface JobApplicationsDialogProps {
  job: AdminJob | null;
  onOpenChange: (open: boolean) => void;
}

export function JobApplicationsDialog({ job, onOpenChange }: JobApplicationsDialogProps) {
  const { data, isLoading } = useJobApplications(job?._id ?? null);
  const statusMutation = useUpdateApplicationStatus(job?._id ?? "");
  const applications = data?.applications ?? [];

  return (
    <Dialog open={!!job} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {job?.title} at {job?.company} — Applications
          </DialogTitle>
          <DialogDescription>{applications.length} application(s) received.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : applications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>
                      <p className="font-medium">{app.student.name}</p>
                      <p className="text-xs text-muted-foreground">{app.student.email}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={app.status}
                        onValueChange={(status) =>
                          statusMutation.mutate({
                            applicationId: app._id,
                            status: status as ApplicationStatus,
                          })
                        }
                      >
                        <SelectTrigger className="h-7 w-44 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              <Badge className={statusBadgeClassName(s)}>{s.replace("_", " ")}</Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
