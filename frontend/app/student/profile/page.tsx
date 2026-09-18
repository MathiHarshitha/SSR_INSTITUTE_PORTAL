"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { BasicInfoCard } from "@/components/shared/basic-info-card";
import { StudentProfileCard } from "@/components/student/student-profile-card";
import { useCurrentUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth-store";
import { StudentProfileData } from "@/types/profile";

export default function StudentProfilePage() {
  const storedUser = useAuthStore((s) => s.user);
  const { data: user, isLoading } = useCurrentUser();
  const effectiveUser = user ?? storedUser;
  const profile = (effectiveUser?.profile as StudentProfileData | null) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">
          View and update your personal, education, and professional details.
        </p>
      </div>

      {isLoading && !effectiveUser ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : effectiveUser ? (
        <>
          <BasicInfoCard user={effectiveUser} />
          <StudentProfileCard profile={profile} />
        </>
      ) : null}
    </div>
  );
}
