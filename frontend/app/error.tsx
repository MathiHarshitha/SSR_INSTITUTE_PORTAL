"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ChevronDown, Home, RotateCw } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { roleHomePath } from "@/hooks/useAuth";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  // Don't refetch the current user here — the API itself may be what failed.
  // The cached user is only used to pick where "home" is.
  const user = useAuthStore((s) => s.user);
  const homeHref = user ? roleHomePath(user.role) : "/";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-status-critical/10">
        <AlertTriangle className="h-10 w-10 text-status-critical" />
      </div>

      <h1 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
        This page ran into an unexpected problem. Try reloading. If it keeps happening, let the
        admin team know.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="clay-btn flex items-center gap-2 bg-[#0092b5] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00a6cc]"
        >
          <RotateCw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href={homeHref}
          className="clay-btn flex items-center gap-2 bg-muted px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Home className="h-4 w-4" />
          {user ? "Back to Dashboard" : "Back to Home"}
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

      <div className="mt-8 w-full max-w-md">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="mx-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Error details
          <ChevronDown className={`h-3 w-3 transition-transform ${showDetails ? "rotate-180" : ""}`} />
        </button>
        {showDetails && (
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-muted p-3 text-left text-xs text-muted-foreground">
            {error.message || "Unknown error"}
            {error.digest ? `\n\nRef: ${error.digest}` : ""}
          </pre>
        )}
      </div>
    </div>
  );
}
