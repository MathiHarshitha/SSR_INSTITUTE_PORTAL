import { z } from "zod";

/**
 * A URL that is safe to render as a link: http(s) only. Plain `z.url()` also accepts
 * `javascript:`, `data:` and `file:` URLs, which become stored XSS / phishing vectors the moment
 * another user (e.g. a trainer reviewing a submission) clicks them.
 */
export function httpUrl(message = "Must be a valid http(s) URL") {
  return z
    .string()
    .trim()
    .url(message)
    .refine((value) => {
      try {
        const { protocol } = new URL(value);
        return protocol === "http:" || protocol === "https:";
      } catch {
        return false;
      }
    }, message);
}

/** Free-text search input: bounded length so it can't be used to make regex scans expensive. */
export const searchText = z.string().trim().max(100);
