"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Loader2,
  Pencil,
  Mail,
  Phone,
  Cake,
  VenusAndMars,
  MapPin,
  CalendarPlus2,
  BookOpen,
  Layers,
  GraduationCap,
  CheckCircle2,
  CalendarCheck,
  Award,
  Trophy,
  KeyRound,
  Search,
  FileDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth-store";
import { useUpdateMe } from "@/hooks/useProfile";
import { useUploadFile } from "@/hooks/useUpload";
import { useMyEnrollments } from "@/hooks/useEnrollments";
import { useMyCertificates } from "@/hooks/useCertificates";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useAttendanceSummary } from "@/hooks/useAttendance";
import { useStudentTasks } from "@/hooks/useTasks";
import { useInterviews } from "@/hooks/useInterviews";
import { StudentProfileData } from "@/types/profile";
import { StatCard } from "@/components/shared/stat-card";
import { EditProfileDialog } from "@/components/student/edit-profile-dialog";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function StudentProfilePage() {
  const storedUser = useAuthStore((s) => s.user);
  const { data: user } = useCurrentUser();
  const effectiveUser = user ?? storedUser;
  const profile = (effectiveUser?.profile as StudentProfileData | null) ?? null;
  const [editOpen, setEditOpen] = useState(false);

  const updateMe = useUpdateMe();
  const uploadMutation = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: enrollments } = useMyEnrollments();
  const { data: certificates } = useMyCertificates();
  const { data: dashboard } = useStudentDashboard();
  const { data: tasks } = useStudentTasks({});
  const { data: interviews } = useInterviews();
  const batchId = dashboard?.enrollment?.batch._id ?? null;
  const { data: attendanceSummary } = useAttendanceSummary(batchId);
  const myAttendance = attendanceSummary?.[0];

  const primaryEnrollment = enrollments?.find((e) => e.course._id === dashboard?.enrollment?.course._id) ?? enrollments?.[0];
  const tasksCompleted = (tasks ?? []).filter((t) => t.mySubmission?.status === "SUBMITTED" || t.mySubmission?.status === "EVALUATED").length;

  const achievements = [
    ...(enrollments ?? [])
      .filter((e) => e.overallProgress >= 100)
      .map((e) => ({ icon: Trophy, label: `Completed ${e.course.name}` })),
    ...(certificates ?? []).map((c) => ({ icon: Award, label: `Certificate earned: ${c.courseName}` })),
    ...(interviews && interviews.length > 0 ? [{ icon: CheckCircle2, label: "Active in Mock Interviews" }] : []),
    ...(myAttendance && myAttendance.percentage >= 80 ? [{ icon: CalendarCheck, label: "Consistent Learner" }] : []),
  ].slice(0, 4);

  function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    uploadMutation.mutate(
      { file, folder: "avatars" },
      { onSuccess: (result) => updateMe.mutate({ avatarUrl: result.url }) }
    );
  }

  if (!effectiveUser) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[32rem] rounded-3xl lg:col-span-1" />
        <Skeleton className="h-[32rem] rounded-3xl lg:col-span-1" />
        <Skeleton className="h-[32rem] rounded-3xl lg:col-span-1" />
      </div>
    );
  }

  const shortId = effectiveUser.id.slice(-6).toUpperCase();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* Column A: photo + course progress */}
      <div className="flex flex-col gap-4 lg:w-[34%] lg:shrink-0">
        <div className="relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2140] to-[#0d1128] shadow-sm">
          {effectiveUser.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={effectiveUser.avatarUrl} alt={effectiveUser.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10 text-3xl font-bold text-white">
                {initials(effectiveUser.name)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="relative ml-auto mt-3 mr-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-60"
          >
            {uploadMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            Change Photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelected} />

          <div className="relative p-4">
            <div className="mb-2 h-1 w-10 rounded-full bg-secondary" />
            <p className="text-sm font-semibold text-white">Discipline today</p>
            <p className="text-sm font-semibold text-white">creates the opportunities tomorrow.</p>
          </div>
        </div>

        <div className="clay p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Current Course Progress</p>
            <Link href="/student/courses" className="flex items-center gap-1 text-xs font-medium text-secondary hover:underline">
              View All
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {primaryEnrollment ? (
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <BookOpen className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{primaryEnrollment.course.name}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress value={primaryEnrollment.overallProgress} className="flex-1" />
                  <span className="text-xs font-bold text-foreground">{primaryEnrollment.overallProgress}%</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {primaryEnrollment.totalCompleted} of {primaryEnrollment.totalLessons} lessons completed
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">You are not enrolled in any course yet.</p>
          )}
        </div>
      </div>

      {/* Column B: info + bio + achievements */}
      <div className="flex flex-col gap-4 lg:w-[38%] lg:shrink-0">
        <div className="clay p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <p className="text-lg font-bold text-foreground">{effectiveUser.name}</p>
              <p className="text-xs text-muted-foreground">Student ID: SSR-{shortId}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-status-good/10 px-2.5 py-1 text-[11px] font-semibold text-status-good">
                {effectiveUser.status === "ACTIVE" ? "Active" : effectiveUser.status}
              </span>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/85"
              >
                <Pencil className="h-3 w-3" />
                Edit Profile
              </button>
            </div>
          </div>

          <dl className="space-y-2.5">
            {[
              { icon: Mail, label: "Email", value: effectiveUser.email },
              { icon: Phone, label: "Phone", value: effectiveUser.phone ?? "—" },
              { icon: Cake, label: "Date of Birth", value: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "—" },
              { icon: VenusAndMars, label: "Gender", value: profile?.gender ? profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase() : "—" },
              { icon: MapPin, label: "Location", value: profile?.address ?? "—" },
              { icon: CalendarPlus2, label: "Joining Date", value: dashboard?.enrollment ? new Date(dashboard.enrollment.enrolledAt).toLocaleDateString() : "—" },
              { icon: BookOpen, label: "Course", value: dashboard?.enrollment?.course.name ?? "—" },
              { icon: Layers, label: "Batch", value: dashboard?.enrollment?.batch.name ?? "—" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2.5 text-xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <row.icon className="h-3.5 w-3.5" />
                </span>
                <span className="w-24 shrink-0 text-muted-foreground">{row.label}</span>
                <span className="truncate font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </dl>
        </div>

        <div className="clay p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Bio</p>
            <button type="button" onClick={() => setEditOpen(true)} className="text-secondary hover:text-secondary/80">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {profile?.experience || "Add a short bio to tell trainers and recruiters about yourself."}
          </p>
          {profile?.skills && profile.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="clay p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Achievements</p>
          </div>
          {achievements.length === 0 ? (
            <p className="text-xs text-muted-foreground">Keep learning — your achievements will show up here.</p>
          ) : (
            <ul className="space-y-2">
              {achievements.map((a, i) => (
                <li key={i} className="flex items-center gap-2.5 text-xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <a.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate text-foreground">{a.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Column C: quote, stats, quick actions, banner */}
      <div className="flex flex-1 flex-col gap-4">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary/10 to-accent/10 p-4 shadow-sm">
          <p className="text-sm font-semibold italic leading-snug text-foreground">
            &ldquo;Small steps today, big opportunities tomorrow.&rdquo;
          </p>
          <p className="mt-1 text-xs text-muted-foreground">— SSR Institute</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Courses Enrolled" value={enrollments?.length ?? 0} icon={GraduationCap} color="violet" />
          <StatCard label="Tasks Completed" value={tasksCompleted} icon={CheckCircle2} color="green" />
          <StatCard label="Attendance" value={myAttendance ? `${myAttendance.percentage}%` : "—"} icon={CalendarCheck} color="critical" />
          <StatCard label="Certificates Earned" value={certificates?.length ?? 0} icon={Award} color="accent" />
        </div>

        <div className="clay p-4">
          <p className="mb-2 text-sm font-semibold text-foreground">Quick Actions</p>
          <ul className="space-y-0.5">
            {[
              { label: "Edit Profile", icon: Pencil, onClick: () => setEditOpen(true) },
              { label: "Change Password", icon: KeyRound, href: "/forgot-password" },
              { label: "Search Courses", icon: Search, href: "/student/search" },
              { label: "Print / Save as PDF", icon: FileDown, onClick: () => window.print() },
            ].map((action) =>
              action.href ? (
                <li key={action.label}>
                  <Link href={action.href} className="flex items-center justify-between rounded-xl px-2 py-2 text-xs text-foreground transition-colors hover:bg-muted">
                    <span className="flex items-center gap-2.5">
                      <action.icon className="h-3.5 w-3.5 text-secondary" />
                      {action.label}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </li>
              ) : (
                <li key={action.label}>
                  <button
                    type="button"
                    onClick={action.onClick}
                    className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-xs text-foreground transition-colors hover:bg-muted"
                  >
                    <span className="flex items-center gap-2.5">
                      <action.icon className="h-3.5 w-3.5 text-secondary" />
                      {action.label}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </li>
              )
            )}
          </ul>
        </div>

        <div className="relative flex min-h-[9rem] flex-1 flex-col justify-between overflow-hidden rounded-3xl bg-[#0f172a] p-4 text-white shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/hiking.svg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/55 to-transparent" />
          <p className="relative text-base font-bold leading-tight">
            Dream.
            <br />
            Learn.
            <br />
            Achieve.
          </p>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="relative ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-foreground shadow-md transition-transform hover:scale-105"
            aria-label="Edit profile"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} user={effectiveUser} profile={profile} />
    </div>
  );
}
