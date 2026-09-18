"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { BasicInfoCard } from "@/components/shared/basic-info-card";
import { useCurrentUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth-store";

export default function AdminProfilePage() {
  const storedUser = useAuthStore((s) => s.user);
  const { data: user, isLoading } = useCurrentUser();
  const effectiveUser = user ?? storedUser;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">Your account details.</p>
      </div>

      {isLoading && !effectiveUser ? (
        <Skeleton className="h-64 w-full" />
      ) : effectiveUser ? (
        <BasicInfoCard user={effectiveUser} />
      ) : null}
    </div>
  );
}
