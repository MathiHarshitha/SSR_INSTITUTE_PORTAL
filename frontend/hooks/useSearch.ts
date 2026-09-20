import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services/search.service";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function useSearch(query: string) {
  const debounced = useDebouncedValue(query.trim(), 350);
  return useQuery({
    queryKey: ["search", debounced],
    queryFn: () => searchService.search(debounced),
    enabled: debounced.length >= 2,
  });
}
