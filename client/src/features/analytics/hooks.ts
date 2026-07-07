import { useQuery } from "@tanstack/react-query";
import { getOverview } from "./api";

export function useOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: getOverview,
  });
}
