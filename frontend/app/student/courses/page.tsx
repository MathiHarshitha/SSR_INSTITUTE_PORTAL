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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import { useAuthStore } from "@/store/auth-store";
import { useMyEnrollments } from "@/hooks/useEnrollments";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageBanner } from "@/components/shared/page-banner";

type FilterKey = "all" | "in-progress" | "not-started" | "completed";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Courses" },
  { key: "in-progress", label: "In Progress" },
  { key: "not-started", label: "Not Started" },
  { key: "completed", label: "Completed" },
];

const CARD_ACCENTS = [
  "from-blue-500/15 to-blue-500/5 text-blue-600",
  "from-teal-500/15 to-teal-500/5 text-teal-600",
  "from-orange-500/15 to-orange-500/5 text-orange-600",
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
        <StatCard label="Enrolled Courses" value={all.length} icon={BookOpen} color="primary" />
        <StatCard label="Completed" value={completedCount} icon={CheckCircle2} color="green" />
        <StatCard label="Overall Progress" value={`${avgProgress}%`} icon={TrendingUp} color="secondary" />
        <StatCard label="Lessons Completed" value={lessonsCompleted} icon={GraduationCap} color="accent" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
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
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your courses..."
            className="pl-8"
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
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
          {all.length === 0 ? "You are not enrolled in any course yet." : "No courses match this filter."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e, i) => {
            const status = e.overallProgress >= 100 ? "Completed" : e.overallProgress > 0 ? "In Progress" : "Not Started";
            const statusClass =
              status === "Completed"
                ? "bg-status-good text-white"
                : status === "In Progress"
                  ? "bg-secondary text-white"
                  : "bg-accent text-white";
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
            return (
              <div key={e.enrollmentId} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className={cn("relative flex h-32 items-center justify-center bg-gradient-to-br", accent)}>
                  {e.course.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-10 w-10 opacity-70" />
                  )}
                  <span className={cn("absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold", statusClass)}>
                    {status}
                  </span>
                  <span className="absolute right-2.5 top-2.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {e.totalCompleted}/{e.totalLessons} lessons
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3.5">
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
                    className="mt-auto flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/85"
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
