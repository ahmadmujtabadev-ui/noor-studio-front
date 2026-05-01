import { useQuery } from "@tanstack/react-query";
import { journeyApi, type JourneyResponse } from "@/lib/api/journey.api";

export const JOURNEY_KEY = ["user-journey"] as const;

export function useJourney() {
  return useQuery<JourneyResponse>({
    queryKey: JOURNEY_KEY,
    queryFn:  () => journeyApi.get(),
    staleTime: 30_000,          // re-fetch every 30 s
    refetchOnWindowFocus: true,
  });
}
