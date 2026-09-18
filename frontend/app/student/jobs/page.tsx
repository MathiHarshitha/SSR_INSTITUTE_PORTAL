"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useMyApplications, useStudentJobs, useWithdrawApplication } from "@/hooks/useStudentJobs";
import { ApplyJobDialog } from "@/components/student/apply-job-dialog";
import { ApplicationStatus, StudentApplication, StudentJob } from "@/types/job";

function applicationBadgeClassName(status: ApplicationStatus): string {
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

function BrowseJobsTab() {
  const { data: jobs, isLoading, isError } = useStudentJobs();
  const [applyingJob, setApplyingJob] = useState<StudentJob | null>(null);

  if (isError) return <p className="py-12 text-center text-sm text-muted-foreground">Failed to load jobs.</p>;
  if (isLoading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  if (!jobs || jobs.length === 0)
    return <p className="py-12 text-center text-sm text-muted-foreground">No open positions right now.</p>;

  return (
    <>
      <div className="space-y-3">
        {jobs.map((job) => (
          <Card key={job._id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {job.company} · {job.workMode} · {job.location ?? "Remote"}
                </p>
              </div>
              {!job.isEligible && <Badge variant="outline">Not eligible</Badge>}
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{job.description}</p>
              {job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                  {job.salaryRange ? ` · ${job.salaryRange}` : ""}
                </p>
                {job.applicationStatus ? (
                  <Badge className={applicationBadgeClassName(job.applicationStatus)}>
                    {job.applicationStatus.replace("_", " ")}
                  </Badge>
                ) : (
                  <Button size="sm" disabled={!job.isEligible} onClick={() => setApplyingJob(job)}>
                    Apply
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ApplyJobDialog job={applyingJob} onOpenChange={(open) => !open && setApplyingJob(null)} />
    </>
  );
}

function MyApplicationsTab() {
  const { data: applications, isLoading, isError } = useMyApplications();
  const [withdrawing, setWithdrawing] = useState<StudentApplication | null>(null);
  const withdrawMutation = useWithdrawApplication();

  if (isError)
    return <p className="py-12 text-center text-sm text-muted-foreground">Failed to load applications.</p>;
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (!applications || applications.length === 0)
    return <p className="py-12 text-center text-sm text-muted-foreground">You haven&apos;t applied to any jobs yet.</p>;

  return (
    <>
      <div className="space-y-3">
        {applications.map((app) => (
          <Card key={app._id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{app.job.title}</p>
                <p className="text-sm text-muted-foreground">
                  {app.job.company} · Applied {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={applicationBadgeClassName(app.status)}>{app.status.replace("_", " ")}</Badge>
                {!["SELECTED", "REJECTED", "WITHDRAWN"].includes(app.status) && (
                  <Button variant="outline" size="sm" onClick={() => setWithdrawing(app)}>
                    Withdraw
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!withdrawing}
        onOpenChange={(open) => !open && setWithdrawing(null)}
        title="Withdraw this application?"
        description={`You'll no longer be considered for ${withdrawing?.job.title}.`}
        confirmLabel="Withdraw"
        destructive
        isLoading={withdrawMutation.isPending}
        onConfirm={() => {
          if (withdrawing) {
            withdrawMutation.mutate(withdrawing._id, { onSuccess: () => setWithdrawing(null) });
          }
        }}
      />
    </>
  );
}

export default function StudentJobsPage() {
  const [tab, setTab] = useState<"browse" | "applications">("browse");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Jobs</h2>
        <p className="text-sm text-muted-foreground">Browse openings and track your applications.</p>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant={tab === "browse" ? "secondary" : "ghost"} onClick={() => setTab("browse")}>
          Browse Jobs
        </Button>
        <Button
          size="sm"
          variant={tab === "applications" ? "secondary" : "ghost"}
          onClick={() => setTab("applications")}
        >
          My Applications
        </Button>
      </div>

      {tab === "browse" ? <BrowseJobsTab /> : <MyApplicationsTab />}
    </div>
  );
}
