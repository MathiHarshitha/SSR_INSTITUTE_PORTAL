"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  retry: () => void;
  /** Taller layout for full-screen boundaries (outside the dashboard shell). */
  fullScreen?: boolean;
}

/** Shared UI for the app's error.tsx boundaries: explain, then offer Try again / Reload page. */
export function ErrorFallback({ error, retry, fullScreen }: ErrorFallbackProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className={
        fullScreen
          ? "flex min-h-screen items-center justify-center bg-background p-6"
          : "flex min-h-[60vh] items-center justify-center p-6"
      }
    >
      <div className="w-full max-w-md space-y-4 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </span>
        <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          This page hit an unexpected error. Try again, or reload the page. If it keeps happening,
          contact the institute.
        </p>
        {error.digest && <p className="text-xs text-muted-foreground">Error reference: {error.digest}</p>}
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => retry()}>
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Reload page
          </Button>
        </div>
      </div>
    </div>
  );
}
