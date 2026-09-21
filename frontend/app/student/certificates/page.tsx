"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, ExternalLink, CheckCircle2, Hourglass, Sparkles, Share2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import { useMyCertificates } from "@/hooks/useCertificates";
import { useMyEnrollments } from "@/hooks/useEnrollments";
import { CertificateStatus } from "@/types/certificate";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";

function statusBadgeClassName(status: CertificateStatus): string {
  return status === "ISSUED" ? "bg-status-good/10 text-status-good" : "bg-status-critical/10 text-status-critical";
}

type FilterKey = "all" | "earned" | "in-progress" | "available";

export default function StudentCertificatesPage() {
  const { data: certificates, isLoading, isError } = useMyCertificates();
  const { data: enrollments } = useMyEnrollments();
  const [filter, setFilter] = useState<FilterKey>("all");

  const earned = certificates ?? [];
  const earnedCourseNames = new Set(earned.map((c) => c.courseName));
  const inProgress = (enrollments ?? []).filter((e) => e.overallProgress < 100 && !earnedCourseNames.has(e.course.name));
  const availableToEarn = (enrollments ?? []).filter((e) => e.overallProgress >= 100 && !earnedCourseNames.has(e.course.name));

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Certificates"
        eyebrowIcon={Award}
        title="Celebrate Your"
        titleAccent="Learning Journey"
        subtitle="Earn certificates by completing your courses, and showcase your skills to the world."
        quote="A certificate is proof of your progress, not the end of your journey."
        illustration="/illustrations/certification.svg"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Certificates Earned" value={earned.length} icon={Award} color="primary" />
        <StatCard label="In Progress" value={inProgress.length} icon={Hourglass} color="secondary" />
        <StatCard label="Available to Earn" value={availableToEarn.length} icon={Sparkles} color="accent" />
        <StatCard label="Verified" value={earned.filter((c) => c.status === "ISSUED").length} icon={CheckCircle2} color="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-2">
            {([
              { key: "all", label: "All" },
              { key: "earned", label: `Earned (${earned.length})` },
              { key: "in-progress", label: `In Progress (${inProgress.length})` },
              { key: "available", label: `Available (${availableToEarn.length})` },
            ] as { key: FilterKey; label: string }[]).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  filter === f.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isError ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
              Failed to load certificates.
            </div>
          ) : isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(filter === "all" || filter === "earned") &&
                earned.map((cert) => (
                  <div key={cert._id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="relative m-3 rounded-xl border-2 border-dashed border-secondary/30 bg-gradient-to-br from-secondary/5 to-accent/5 p-4 text-center">
                      <Award className="mx-auto mb-1 h-7 w-7 text-secondary" />
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Certificate of Completion</p>
                      <p className="mt-1 text-sm font-bold text-foreground">{cert.courseName}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3 pt-0">
                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted-foreground">
                          {cert.batchName} · Issued {new Date(cert.issueDate).toLocaleDateString()}
                        </p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground">{cert.certificateNumber}</p>
                      </div>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", statusBadgeClassName(cert.status))}>
                        {cert.status}
                      </span>
                    </div>
                    <div className="flex gap-2 p-3 pt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        render={<Link href={`/verify-certificate/${cert.certificateNumber}`} target="_blank" />}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        render={
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                              `${shareUrl}/verify-certificate/${cert.certificateNumber}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                          />
                        }
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </Button>
                    </div>
                  </div>
                ))}

              {(filter === "all" || filter === "in-progress") &&
                inProgress.map((e) => (
                  <div key={e.enrollmentId} className="overflow-hidden rounded-2xl border border-border bg-card opacity-90 shadow-sm">
                    <div className="relative m-3 rounded-xl border-2 border-dashed border-border bg-muted/40 p-4 text-center">
                      <Hourglass className="mx-auto mb-1 h-7 w-7 text-muted-foreground" />
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Certificate In Progress</p>
                      <p className="mt-1 text-sm font-bold text-foreground">{e.course.name}</p>
                    </div>
                    <div className="space-y-1 p-3 pt-0">
                      <Progress value={e.overallProgress} />
                      <p className="text-[11px] text-muted-foreground">{e.overallProgress}% complete · finish the course to earn this certificate</p>
                    </div>
                  </div>
                ))}

              {(filter === "all" || filter === "available") &&
                availableToEarn.map((e) => (
                  <div key={e.enrollmentId} className="overflow-hidden rounded-2xl border border-accent/30 bg-card shadow-sm">
                    <div className="relative m-3 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-4 text-center">
                      <Sparkles className="mx-auto mb-1 h-7 w-7 text-accent" />
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Available to Earn</p>
                      <p className="mt-1 text-sm font-bold text-foreground">{e.course.name}</p>
                    </div>
                    <p className="p-3 pt-0 text-[11px] text-muted-foreground">
                      You&apos;ve completed this course — your trainer or admin will issue your certificate soon.
                    </p>
                  </div>
                ))}

              {filter === "all" && earned.length === 0 && inProgress.length === 0 && availableToEarn.length === 0 && (
                <div className="col-span-2 rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
                  You are not enrolled in any course yet.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary/10 to-accent/10 p-4 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Share Your Achievement</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Share your certificates on LinkedIn and showcase your skills to potential employers.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-foreground">Your Learning Milestones</p>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <CheckCircle2 className={cn("h-3.5 w-3.5", (enrollments?.length ?? 0) > 0 ? "text-status-good" : "text-muted-foreground")} />
                <span className={(enrollments?.length ?? 0) > 0 ? "text-foreground" : "text-muted-foreground"}>
                  Enrolled in {enrollments?.length ?? 0} course{(enrollments?.length ?? 0) === 1 ? "" : "s"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={cn("h-3.5 w-3.5", earned.length > 0 ? "text-status-good" : "text-muted-foreground")} />
                <span className={earned.length > 0 ? "text-foreground" : "text-muted-foreground"}>Earned {earned.length} certificate{earned.length === 1 ? "" : "s"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={cn("h-3.5 w-3.5", availableToEarn.length > 0 ? "text-status-good" : "text-muted-foreground")} />
                <span className={availableToEarn.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                  {availableToEarn.length} certificate{availableToEarn.length === 1 ? "" : "s"} ready to be issued
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
