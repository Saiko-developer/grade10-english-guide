import { useQuery } from "@tanstack/react-query";

import { fetchCurriculum, LOCAL_CURRICULUM, type Curriculum } from "@/lib/curriculum";

/**
 * Returns the Unit 1 curriculum from the Cloud database, transparently falling
 * back to the bundled local JSON when the database is unreachable/empty.
 * Never throws and never leaves the UI without data.
 */
export function useCurriculum(): Curriculum {
  const { data } = useQuery({
    queryKey: ["curriculum", "unit-1"],
    queryFn: fetchCurriculum,
    staleTime: 5 * 60_000,
    placeholderData: LOCAL_CURRICULUM,
  });

  return data ?? LOCAL_CURRICULUM;
}
