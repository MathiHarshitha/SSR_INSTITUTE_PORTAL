"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { BasicInfoCard } from "@/components/shared/basic-info-card";
import { TrainerProfileCard } from "@/components/trainer/trainer-profile-card";
import { useCurrentUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth-store";
import { TrainerProfileData } from "@/types/profile";

export default function TrainerProfilePage() {
  const storedUser = useAuthStore((s) => s.user);
  const { data: user, isLoading } = useCurrentUser();
  const effectiveUser = user ?? storedUser;
  const profile = (effectiveUser?.profile as TrainerProfileData | null) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">
          View and update your qualification, skills, and specialization.
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
          <TrainerProfileCard profile={profile} />
        </>
      ) : null}
    </div>
  );
}
