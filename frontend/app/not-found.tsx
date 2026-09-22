"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useCurrentUser, roleHomePath } from "@/hooks/useAuth";

export default function NotFound() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  // The persisted store can hold a stale user from an expired/invalid session —
  // only trust a session the backend has actually just confirmed (same check
  // RequireAuth uses), never the cached store value alone.
  const { data: verifiedUser } = useCurrentUser();
  const isAuthenticated = isHydrated && !!accessToken && !!verifiedUser;
  const homeHref = isAuthenticated ? roleHomePath(verifiedUser.role) : "/";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl">
        <Image
          src="/illustrations/404.png"
          alt="Lost character surrounded by a giant 404, a signpost, and a curious cat"
          width={1536}
          height={1024}
          priority
          className="h-auto w-full select-none"
        />
      </div>

      <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">Page Not Found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
        The page you&apos;re looking for doesn&apos;t exist, moved, or the link is broken.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={homeHref}
          className="clay-btn flex items-center gap-2 bg-[#0092b5] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00a6cc]"
        >
          <Home className="h-4 w-4" />
          {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="clay-btn flex items-center gap-2 bg-muted px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}
