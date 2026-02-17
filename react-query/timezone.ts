import { useQuery, useQueryClient } from "@tanstack/react-query";

const TIMEZONE_KEY = "user-timezone";

export const useGetTimezone = () => {
  return useQuery({
    queryKey: [TIMEZONE_KEY],
    queryFn: () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem(TIMEZONE_KEY) || "Europe/London";
      }
      return "Europe/London";
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useSetTimezone = () => {
  const queryClient = useQueryClient();
  return (timezone: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TIMEZONE_KEY, timezone);
      queryClient.setQueryData([TIMEZONE_KEY], timezone);
    }
  };
};
