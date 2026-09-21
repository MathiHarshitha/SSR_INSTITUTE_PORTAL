"use client";

import { format, isSameWeek, isToday, isFuture, isPast } from "date-fns";
import { CalendarDays, Clock3, Video, ListTodo, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import { useClasses } from "@/hooks/useSchedule";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageBanner } from "@/components/shared/page-banner";
import { MiniCalendar, CalendarMark } from "@/components/shared/mini-calendar";

export default function StudentSchedulePage() {
  const { data: classes, isLoading, isError } = useClasses({});

  const all = classes ?? [];
  const now = new Date();

  const thisWeek = all.filter((c) => isSameWeek(new Date(c.date), now, { weekStartsOn: 1 }));
  const upcoming = all
    .filter((c) => isFuture(new Date(c.date)) || isToday(new Date(c.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = all.filter((c) => isPast(new Date(c.date)) && !isToday(new Date(c.date)));
  const todaysClasses = all
    .filter((c) => isToday(new Date(c.date)))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const completion = all.length ? Math.round((past.length / all.length) * 100) : 0;

  const marks: CalendarMark[] = all.map((c) => ({
    date: format(new Date(c.date), "yyyy-MM-dd"),
    className: isPast(new Date(c.date)) && !isToday(new Date(c.date)) ? "bg-muted-foreground" : "bg-secondary",
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Schedule"
        eyebrowIcon={CalendarDays}
        title="Class"
        titleAccent="Schedule"
        subtitle="Plan your learning. Stay consistent. Achieve your goals."
        quote="A well-planned day leads to a successful tomorrow."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Classes This Week" value={thisWeek.length} icon={CalendarDays} color="violet" />
        <StatCard label="Upcoming Classes" value={upcoming.length} icon={Clock3} color="secondary" />
        <StatCard label="Classes Today" value={todaysClasses.length} icon={ListTodo} color="accent" />
        <StatCard label="Schedule Completion" value={`${completion}%`} icon={Target} color="green" />
      </div>

      {isError ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
          Failed to load schedule.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <MiniCalendar
              marks={marks}
              legend={[
                { label: "Scheduled", className: "bg-secondary" },
                { label: "Completed", className: "bg-muted-foreground" },
              ]}
            />
          </div>

          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Today&apos;s Schedule</p>
              <span className="text-xs text-muted-foreground">{format(now, "EEE, MMM d, yyyy")}</span>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : todaysClasses.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No classes scheduled today. Enjoy the break!</p>
            ) : (
              <ul className="space-y-2">
                {todaysClasses.map((c) => (
                  <li key={c._id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                      <Video className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{c.topic}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.startTime}–{c.endTime} · {c.batch.name}
                      </p>
                    </div>
                    {c.meetingLink && (
                      <a
                        href={c.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/85"
                      >
                        Join
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">Upcoming This Week</p>
          {thisWeek.filter((c) => !isPast(new Date(c.date)) || isToday(new Date(c.date))).length === 0 ? (
            <p className="text-sm text-muted-foreground">No more classes scheduled this week.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {thisWeek
                .filter((c) => !isPast(new Date(c.date)) || isToday(new Date(c.date)))
                .map((c) => (
                  <li key={c._id} className="rounded-xl border border-border p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-foreground">{format(new Date(c.date), "EEE, MMM d")}</p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                          isToday(new Date(c.date)) ? "bg-status-good/10 text-status-good" : "bg-secondary/10 text-secondary"
                        )}
                      >
                        {isToday(new Date(c.date)) ? "Live" : "Upcoming"}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.topic}</p>
                    <p className="text-[11px] text-muted-foreground">{c.startTime}–{c.endTime}</p>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      <PageBanner
        icon={Target}
        title="Consistency Creates Progress"
        subtitle="Stick to your schedule and see how far you can go."
        illustration="/illustrations/target.svg"
      />
    </div>
  );
}
