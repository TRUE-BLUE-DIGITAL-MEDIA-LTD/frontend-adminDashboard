import { useQuery } from "@tanstack/react-query";
import { GetUser } from "../services/admin/user";

export const userKeys = {
  get: ["user"],
} as const;
export function useGetUser() {
  return useQuery({
    queryKey: userKeys.get,
    queryFn: () => GetUser({}),
  });
}
