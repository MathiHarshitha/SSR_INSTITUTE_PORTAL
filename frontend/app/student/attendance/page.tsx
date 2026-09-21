"use client";

import { format, isSameMonth } from "date-fns";
import { CalendarCheck, CalendarX, Clock3, TrendingUp, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useAttendance, useAttendanceSummary } from "@/hooks/useAttendance";
import { AttendanceStatus } from "@/types/attendance";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageBanner } from "@/components/shared/page-banner";
import { MiniCalendar, CalendarMark } from "@/components/shared/mini-calendar";
import { ProgressRing } from "@/components/shared/progress-ring";

const STATUS_DOT: Record<AttendanceStatus, string> = {
  PRESENT: "bg-status-good",
  ABSENT: "bg-status-critical",
  LATE: "bg-status-serious",
  LEAVE: "bg-secondary",
};

const STATUS_BADGE: Record<AttendanceStatus, string> = {
  PRESENT: "bg-status-good/10 text-status-good",
  ABSENT: "bg-status-critical/10 text-status-critical",
  LATE: "bg-status-serious/15 text-status-serious",
  LEAVE: "bg-secondary/10 text-secondary",
};

export default function StudentAttendancePage() {
  const { data: dashboard } = useStudentDashboard();
  const batchId = dashboard?.enrollment?.batch._id ?? "";

  const { data: records, isLoading } = useAttendance(batchId);
  const { data: summary } = useAttendanceSummary(batchId || null);
  const mySummary = summary?.[0];

  const now = new Date();
  const thisMonthRecords = (records ?? []).filter((r) => isSameMonth(new Date(r.date), now));
  const attendedThisMonth = thisMonthRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const missedThisMonth = thisMonthRecords.filter((r) => r.status === "ABSENT").length;
  const onLeave = thisMonthRecords.filter((r) => r.status === "LEAVE").length;

  const marks: CalendarMark[] = (records ?? []).map((r) => ({
    date: format(new Date(r.date), "yyyy-MM-dd"),
    className: STATUS_DOT[r.status],
  }));

  const recent = [...(records ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Your Learning Journey"
        eyebrowIcon={CalendarCheck}
        title="Attendance"
        subtitle="Track your class attendance and maintain your learning consistency."
        quote="Consistency is a superpower."
      />

      {!batchId ? null : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
            <ProgressRing value={mySummary?.percentage ?? 0} size={52} strokeWidth={6}>
              <span className="text-xs font-bold text-foreground">{mySummary?.percentage ?? 0}%</span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Overall Attendance</p>
              <p className="truncate text-xs text-muted-foreground">
                {mySummary ? `${mySummary.present + mySummary.late} / ${mySummary.total} classes` : "—"}
              </p>
            </div>
          </div>
          <StatCard label="Attended This Month" value={attendedThisMonth} icon={CalendarCheck} color="secondary" />
          <StatCard label="Missed This Month" value={missedThisMonth} icon={CalendarX} color="critical" />
          <StatCard label="On Leave" value={onLeave} icon={Clock3} color="violet" />
        </div>
      )}

      {!batchId ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
          You are not enrolled in a batch yet.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <MiniCalendar
              marks={marks}
              legend={[
                { label: "Present", className: "bg-status-good" },
                { label: "Absent", className: "bg-status-critical" },
                { label: "Late", className: "bg-status-serious" },
                { label: "Leave", className: "bg-secondary" },
              ]}
            />
          </div>

          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm lg:col-span-2">
            <p className="mb-3 text-sm font-semibold text-foreground">Recent Classes</p>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No attendance recorded yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((r) => (
                  <li key={r._id} className="flex items-center justify-between gap-2 py-2">
                    <span className="text-xs text-muted-foreground">{format(new Date(r.date), "MMM d, yyyy")}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_BADGE[r.status])}>
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {mySummary && mySummary.percentage < 90 && (
        <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-3">
          <TrendingUp className="h-5 w-5 shrink-0 text-accent" />
          <p className="text-xs text-foreground">
            Need to be consistent? You&apos;re at {mySummary.percentage}% — keep attending classes to reach 90% attendance.
          </p>
        </div>
      )}

      <PageBanner
        icon={Target}
        title="Every Class Counts!"
        subtitle="Stay consistent, keep learning, and move closer to your goals."
        ctaLabel="View My Schedule"
        ctaHref="/student/schedule"
        illustration="/illustrations/target.svg"
      />
    </div>
  );
}
