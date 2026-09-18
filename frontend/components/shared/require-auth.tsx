"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCurrentUser, roleHomePath } from "@/hooks/useAuth";
import { Role } from "@/types/auth";
import { Skeleton } from "@/components/ui/skeleton";

interface RequireAuthProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

/**
 * Client-side gate for role-restricted layouts. Frontend + backend live on
 * different origins, so a Next.js edge middleware can't read the backend's
 * httpOnly refresh cookie — enforcement here plus the backend's `authorize()`
 * middleware together satisfy "never trust the frontend alone" (spec ยง40/41).
 */
export function RequireAuth({ allowedRoles, children }: RequireAuthProps) {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const storedUser = useAuthStore((s) => s.user);
  const { data: user, isLoading, isError } = useCurrentUser();

  const effectiveUser = user ?? storedUser;

  useEffect(() => {
    if (!isHydrated) return;

    if (!accessToken || isError) {
      router.replace("/login");
      return;
    }

    if (effectiveUser && !allowedRoles.includes(effectiveUser.role)) {
      router.replace(roleHomePath(effectiveUser.role));
    }
  }, [isHydrated, accessToken, isError, effectiveUser, allowedRoles, router]);

  if (!isHydrated || !accessToken || isLoading || !effectiveUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(effectiveUser.role)) {
    return null;
  }

  return <>{children}</>;
}
