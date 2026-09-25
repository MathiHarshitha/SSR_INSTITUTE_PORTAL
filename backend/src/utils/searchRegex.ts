/** Case-insensitive *literal* match for a user's search text. Raw input must never be compiled
 * as a pattern: `(a+)+$`-style input stalls the event loop (ReDoS), and an invalid pattern
 * throws a 500. */
export function searchRegex(value: string): RegExp {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}
