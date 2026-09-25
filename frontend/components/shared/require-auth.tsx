"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCurrentUser, roleHomePath } from "@/hooks/useAuth";
import { refreshAccessToken } from "@/lib/api-client";
import { Role } from "@/types/auth";
import { Skeleton } from "@/components/ui/skeleton";

interface RequireAuthProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

/**
 * Client-side gate for role-restricted layouts — UX only; the backend's `authenticate` +
 * `authorize()` middleware is the actual enforcement. The access token lives only in memory,
 * so after a reload we first try to restore the session from the httpOnly refresh cookie.
 */
export function RequireAuth({ allowedRoles, children }: RequireAuthProps) {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const storedUser = useAuthStore((s) => s.user);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const restoring = useRef(false);
  const { data: user, isLoading, isError } = useCurrentUser();

  const effectiveUser = user ?? storedUser;

  useEffect(() => {
    if (!isHydrated || accessToken || restoring.current || restoreFailed) return;
    restoring.current = true;
    refreshAccessToken().then((token) => {
      restoring.current = false;
      if (token) {
        setAccessToken(token);
      } else {
        clearAuth();
        setRestoreFailed(true);
      }
    });
  }, [isHydrated, accessToken, restoreFailed, setAccessToken, clearAuth]);

  useEffect(() => {
    if (!isHydrated) return;

    if (restoreFailed || isError) {
      router.replace("/login");
      return;
    }

    if (accessToken && effectiveUser && !allowedRoles.includes(effectiveUser.role)) {
      router.replace(roleHomePath(effectiveUser.role));
    }
  }, [isHydrated, accessToken, restoreFailed, isError, effectiveUser, allowedRoles, router]);

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
