import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services/search.service";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function useSearch(query: string) {
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, 350);
  const result = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => searchService.search(debounced),
    enabled: debounced.length >= 2,
  });
  // True while the user is still typing and the request for the latest text hasn't gone out yet.
  return { ...result, isDebouncing: trimmed !== debounced };
}
