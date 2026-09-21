"use client";

import { useMemo, useState } from "react";
import { format, isFuture, isToday } from "date-fns";
import { Video, Star, CalendarClock, Award, ThumbsUp, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import { useInterviews } from "@/hooks/useInterviews";
import { InterviewResult } from "@/types/interview";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";

type FilterKey = "all" | "upcoming" | "completed";

function resultBadgeClassName(result: InterviewResult): string {
  switch (result) {
    case "RECOMMENDED":
      return "bg-status-good/10 text-status-good";
    case "NOT_RECOMMENDED":
      return "bg-status-critical/10 text-status-critical";
    case "PENDING":
      return "bg-muted text-muted-foreground";
  }
}

const TIPS = [
  "Review your course materials",
  "Practice common interview questions",
  "Take notes from past feedback",
  "Be on time",
  "Show confidence",
];

export default function StudentInterviewsPage() {
  const { data: interviews, isLoading, isError } = useInterviews();
  const [filter, setFilter] = useState<FilterKey>("all");

  const all = interviews ?? [];
  const upcoming = all.filter((iv) => isFuture(new Date(iv.date)) || isToday(new Date(iv.date)));
  const completed = all.filter((iv) => iv.result !== "PENDING" || iv.rating);
  const rated = all.filter((iv) => iv.rating);
  const avgRating = rated.length ? (rated.reduce((s, iv) => s + (iv.rating ?? 0), 0) / rated.length).toFixed(1) : "—";
  const recommended = all.filter((iv) => iv.result === "RECOMMENDED").length;

  const filtered = useMemo(() => {
    if (filter === "upcoming") return upcoming;
    if (filter === "completed") return completed;
    return all;
  }, [filter, all, upcoming, completed]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Mock Interviews"
        eyebrowIcon={Video}
        title="Mock"
        titleAccent="Interviews"
        subtitle="Practice. Get feedback. Be job ready."
        quote="Confidence comes from preparation."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Completed" value={completed.length} icon={Video} color="primary" />
        <StatCard label="Average Rating" value={avgRating === "—" ? "—" : `${avgRating}/5`} icon={Star} color="secondary" />
        <StatCard label="Upcoming" value={upcoming.length} icon={CalendarClock} color="violet" />
        <StatCard label="Recommended" value={recommended} icon={ThumbsUp} color="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-2">
            {([
              { key: "all", label: `All (${all.length})` },
              { key: "upcoming", label: `Upcoming (${upcoming.length})` },
              { key: "completed", label: `Completed (${completed.length})` },
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
              Failed to load interviews.
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
              No interviews in this view.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((iv) => (
                <div key={iv._id} className="flex gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
                  <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border py-1.5 text-center">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      {format(new Date(iv.date), "MMM")}
                    </span>
                    <span className="text-lg font-bold leading-none text-foreground">{format(new Date(iv.date), "d")}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {iv.type.replace("_", " ")} Interview
                      </p>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", resultBadgeClassName(iv.result))}>
                        {iv.result.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {iv.time} · {iv.interviewer.name}
                      {iv.batch ? ` · ${iv.batch.name}` : ""}
                    </p>
                    {iv.topics.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {iv.topics.map((t) => (
                          <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {iv.meetingLink && (
                        <a
                          href={iv.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Join link
                        </a>
                      )}
                      {iv.rating && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                          <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                          {iv.rating}/5
                        </span>
                      )}
                    </div>
                    {iv.feedback && (
                      <p className="mt-1.5 line-clamp-2 border-t border-border pt-1.5 text-xs text-muted-foreground">
                        {iv.feedback}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-secondary" />
              Prepare for Your Interview
            </p>
            <ul className="space-y-2">
              {TIPS.map((tip) => (
                <li key={tip} className="flex items-center gap-2 text-xs text-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary/10 to-accent/10 p-4 shadow-sm">
            <Award className="mb-2 h-6 w-6 text-secondary" />
            <p className="text-xs font-medium text-foreground">
              Want another mock round? Ask your trainer or admin to schedule your next mock interview session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
