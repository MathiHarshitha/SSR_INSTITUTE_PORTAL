"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Search,
  Target,
  ArrowRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import { useAuthStore } from "@/store/auth-store";
import { useMyEnrollments } from "@/hooks/useEnrollments";
import { PageHeader } from "@/components/shared/page-header";
import { PageBanner } from "@/components/shared/page-banner";

type FilterKey = "all" | "in-progress" | "not-started" | "completed";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Courses" },
  { key: "in-progress", label: "In Progress" },
  { key: "not-started", label: "Not Started" },
  { key: "completed", label: "Completed" },
];

const STAT_ACCENTS = ["bg-emerald-500", "bg-brand-600", "bg-amber-500", "bg-violet-500"];

const CARD_ACCENTS = [
  "from-emerald-500/15 to-emerald-500/5 text-emerald-600",
  "from-brand-500/15 to-brand-500/5 text-brand-600",
  "from-amber-500/15 to-amber-500/5 text-amber-600",
];

export default function StudentCoursesPage() {
  const user = useAuthStore((s) => s.user);
  const { data: enrollments, isLoading } = useMyEnrollments();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  const all = enrollments ?? [];
  const completedCount = all.filter((e) => e.overallProgress >= 100).length;
  const avgProgress = all.length
    ? Math.round(all.reduce((sum, e) => sum + e.overallProgress, 0) / all.length)
    : 0;
  const lessonsCompleted = all.reduce((sum, e) => sum + e.totalCompleted, 0);

  const filtered = useMemo(() => {
    return all
      .filter((e) => {
        if (filter === "in-progress") return e.overallProgress > 0 && e.overallProgress < 100;
        if (filter === "not-started") return e.overallProgress === 0;
        if (filter === "completed") return e.overallProgress >= 100;
        return true;
      })
      .filter((e) => e.course.name.toLowerCase().includes(search.toLowerCase()));
  }, [all, filter, search]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="My Courses"
        eyebrowIcon={GraduationCap}
        title="My"
        titleAccent="Courses"
        subtitle="Access all your enrolled courses, track progress, and keep learning."
        quote="Discipline today creates opportunities tomorrow."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Enrolled Courses", value: all.length, icon: BookOpen },
          { label: "Completed", value: completedCount, icon: CheckCircle2 },
          { label: "Overall Progress", value: `${avgProgress}%`, icon: TrendingUp },
          { label: "Lessons Completed", value: lessonsCompleted, icon: GraduationCap },
        ].map((stat, i) => (
          <div key={stat.label} className="clay flex items-center gap-3 p-3.5">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white",
                STAT_ACCENTS[i % STAT_ACCENTS.length]
              )}
            >
              <stat.icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight tracking-tight text-foreground">{stat.value}</p>
              <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "clay-btn rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                filter === f.key
                  ? "bg-emerald-600 text-white"
                  : "bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="clay-inset relative flex w-full items-center sm:w-64">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search your courses..."
            className="w-full rounded-[1.25rem] bg-transparent py-2.5 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="clay py-16 text-center text-sm text-muted-foreground">
          {all.length === 0 ? "You are not enrolled in any course yet." : "No courses match this filter."}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e, i) => {
            const status = e.overallProgress >= 100 ? "Completed" : e.overallProgress > 0 ? "In Progress" : "Not Started";
            const statusClass =
              status === "Completed"
                ? "bg-emerald-600 text-white"
                : status === "In Progress"
                  ? "bg-brand-600 text-white"
                  : "bg-amber-500 text-white";
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
            return (
              <div key={e.enrollmentId} className="clay clay-hover flex flex-col overflow-hidden">
                <div className={cn("relative flex h-32 items-center justify-center bg-gradient-to-br", accent)}>
                  {e.course.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-10 w-10 opacity-70" />
                  )}
                  <span className={cn("clay-btn absolute left-2.5 top-2.5 px-2 py-0.5 text-[10px] font-semibold", statusClass)}>
                    {status}
                  </span>
                  <span className="clay-btn absolute right-2.5 top-2.5 bg-slate-900/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {e.totalCompleted}/{e.totalLessons} lessons
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-semibold text-foreground">{e.course.name}</p>
                  <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{e.course.shortDescription}</p>
                  <div className="mb-3 space-y-1">
                    <Progress value={e.overallProgress} />
                    <p className="text-right text-[11px] text-muted-foreground">{e.overallProgress}%</p>
                  </div>
                  {e.course.category && (
                    <p className="mb-3 text-[11px] text-muted-foreground">{e.course.category} · {e.course.duration}</p>
                  )}
                  <Link
                    href={`/student/courses/${e.course._id}`}
                    className="clay-btn mt-auto flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-500"
                  >
                    Continue Learning
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PageBanner
        icon={Target}
        title="Stay Consistent!"
        subtitle="Every lesson you complete is a step closer to your dream career."
        ctaLabel="Explore More Courses"
        ctaHref="/student/search"
        illustration="/illustrations/target.svg"
      />

      {user && (
        <p className="text-center text-[11px] text-muted-foreground">Keep going, {user.name.split(" ")[0]} — you&apos;ve got this. 🚀</p>
      )}
    </div>
  );
}
