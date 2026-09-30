"use client";

import { ErrorFallback } from "@/components/shared/error-fallback";

/** Catches errors anywhere below the root layout — including the admin/trainer/student layouts
 * themselves (e.g. the top bar), which their own error.tsx files can't catch. */
export default function RootError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorFallback error={error} retry={retry} fullScreen />;
}
