"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  Building2,
  Search,
  Send,
  Award,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "cn";
import { useMyApplications, useStudentJobs, useWithdrawApplication } from "@/hooks/useStudentJobs";
import { useMyEnrollments } from "@/hooks/useEnrollments";
import { useAuthStore } from "@/store/auth-store";
import { ApplyJobDialog } from "@/components/student/apply-job-dialog";
import { ApplicationStatus, StudentApplication, StudentJob, WorkMode } from "@/types/job";
import { StudentProfileData } from "@/types/profile";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressRing } from "@/components/shared/progress-ring";

type ModeFilter = "ALL" | WorkMode;

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

export default function StudentJobsPage() {
  const user = useAuthStore((s) => s.user);
  const profile = (user?.profile as StudentProfileData | null) ?? null;
  const { data: jobs, isLoading, isError } = useStudentJobs();
  const { data: applications } = useMyApplications();
  const { data: enrollments } = useMyEnrollments();
  const [applyingJob, setApplyingJob] = useState<StudentJob | null>(null);
  const [withdrawing, setWithdrawing] = useState<StudentApplication | null>(null);
  const withdrawMutation = useWithdrawApplication();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<ModeFilter>("ALL");

  const allJobs = jobs ?? [];
  const allApplications = applications ?? [];
  const companies = new Set(allJobs.map((j) => j.company)).size;
  const selected = allApplications.filter((a) => a.status === "SELECTED").length;

  const filtered = useMemo(() => {
    return allJobs
      .filter((j) => mode === "ALL" || j.workMode === mode)
      .filter(
        (j) =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.company.toLowerCase().includes(search.toLowerCase())
      );
  }, [allJobs, mode, search]);

  const checklist = [
    { label: "Complete core courses", done: (enrollments ?? []).some((e) => e.overallProgress >= 100) },
    { label: "Build your portfolio", done: !!(profile?.portfolioUrl || profile?.githubUrl) },
    { label: "Add your resume", done: !!profile?.resumeUrl },
    { label: "Apply to relevant jobs", done: allApplications.length > 0 },
  ];
  const careerProgress = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Career Opportunities"
        eyebrowIcon={Briefcase}
        title="Jobs &"
        titleAccent="Placements"
        subtitle="Find the right opportunities. Build your career with confidence."
        quote="Better Skills, Brighter Career."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active Job Openings" value={allJobs.length} icon={Briefcase} color="secondary" />
        <StatCard label="Hiring Companies" value={companies} icon={Building2} color="primary" />
        <StatCard label="My Applications" value={allApplications.length} icon={Send} color="accent" />
        <StatCard label="Selected" value={selected} icon={Award} color="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {([
                { key: "ALL", label: "All Jobs" },
                { key: "ONSITE", label: "Onsite" },
                { key: "REMOTE", label: "Remote" },
                { key: "HYBRID", label: "Hybrid" },
              ] as { key: ModeFilter; label: string }[]).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setMode(f.key)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                    mode === f.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by role, company..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isError ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
              Failed to load jobs.
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
              No open positions match your filters right now.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((job) => (
                <div key={job._id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-sm font-bold text-secondary">
                        {job.company.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{job.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {job.company} · {job.workMode} · {job.location ?? "Remote"}
                        </p>
                      </div>
                    </div>
                    {!job.isEligible && (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Not eligible
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{job.description}</p>
                  {job.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {job.skills.map((s) => (
                        <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <p className="text-[11px] text-muted-foreground">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                      {job.salaryRange ? ` · ${job.salaryRange}` : ""}
                    </p>
                    {job.applicationStatus ? (
                      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", applicationBadgeClassName(job.applicationStatus))}>
                        {job.applicationStatus.replace("_", " ")}
                      </span>
                    ) : (
                      <Button size="sm" disabled={!job.isEligible} onClick={() => setApplyingJob(job)}>
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <ProgressRing value={careerProgress} size={64} strokeWidth={7}>
                <span className="text-sm font-bold text-foreground">{careerProgress}%</span>
              </ProgressRing>
              <div>
                <p className="text-sm font-semibold text-foreground">Your Career Progress</p>
                <p className="text-xs text-muted-foreground">Keep learning and applying.</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-xs">
                  <span className={cn("flex h-4 w-4 items-center justify-center rounded border", c.done ? "border-status-good bg-status-good text-white" : "border-border")}>
                    {c.done && "✓"}
                  </span>
                  <span className={c.done ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-2 flex items-center justify-between text-sm font-semibold text-foreground">
              Recent Applications
            </p>
            {allApplications.length === 0 ? (
              <p className="text-xs text-muted-foreground">You haven&apos;t applied to any jobs yet.</p>
            ) : (
              <ul className="space-y-2">
                {allApplications.slice(0, 4).map((app) => (
                  <li key={app._id} className="flex items-center justify-between gap-2 rounded-xl border border-border p-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">{app.job?.title ?? "Job no longer available"}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{app.job?.company ?? "—"}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", applicationBadgeClassName(app.status))}>
                        {app.status.replace("_", " ")}
                      </span>
                      {!["SELECTED", "REJECTED", "WITHDRAWN"].includes(app.status) && (
                        <button
                          type="button"
                          onClick={() => setWithdrawing(app)}
                          className="text-[10px] text-muted-foreground hover:text-destructive"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary/10 to-accent/10 p-4 shadow-sm">
            <Sparkles className="mb-2 h-5 w-5 text-secondary" />
            <p className="text-xs font-medium text-foreground">
              Opportunities don&apos;t happen, you create them.
            </p>
          </div>
        </div>
      </div>

      <ApplyJobDialog job={applyingJob} onOpenChange={(open) => !open && setApplyingJob(null)} />

      <ConfirmDialog
        open={!!withdrawing}
        onOpenChange={(open) => !open && setWithdrawing(null)}
        title="Withdraw this application?"
        description={`You'll no longer be considered for ${withdrawing?.job?.title ?? "this job"}.`}
        confirmLabel="Withdraw"
        destructive
        isLoading={withdrawMutation.isPending}
        onConfirm={() => {
          if (withdrawing) {
            withdrawMutation.mutate(withdrawing._id, { onSuccess: () => setWithdrawing(null) });
          }
        }}
      />
    </div>
  );
}
