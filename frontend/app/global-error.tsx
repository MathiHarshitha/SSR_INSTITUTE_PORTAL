"use client";

import { useEffect } from "react";
import "./globals.css";

// Replaces the root layout when it crashes, so it can't rely on providers,
// theme, or fonts from app/layout.tsx.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <title>Something went wrong · SSR Portal</title>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
            SSR Portal couldn&apos;t load. Please try again in a moment.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="clay-btn bg-[#0092b5] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#00a6cc]"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="clay-btn bg-muted px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Reload Page
            </button>
          </div>
          {error.digest && (
            <p className="mt-6 text-xs text-muted-foreground">Ref: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
