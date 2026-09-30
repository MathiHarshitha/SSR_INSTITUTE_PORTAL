"use client";

import { ErrorFallback } from "@/components/shared/error-fallback";

/** Page-level errors inside the trainer area: keeps the sidebar and top bar usable. */
export default function TrainerError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorFallback error={error} retry={retry} />;
}