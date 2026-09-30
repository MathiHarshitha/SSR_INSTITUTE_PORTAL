"use client";

import "./globals.css";
import { ErrorFallback } from "@/components/shared/error-fallback";

/** Last-resort boundary for errors in the root layout itself; it replaces the whole document. */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <title>Something went wrong · SSR Portal</title>
        <ErrorFallback error={error} retry={retry} fullScreen />
      </body>
    </html>
  );
}
