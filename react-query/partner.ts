import { useQuery } from "@tanstack/react-query";
import {
  GetPartnerByMangegerService,
  GetPartnerByPageService,
  InputGetPartnerByPageService,
} from "../services/admin/partner";

const keyPartners = {
  gets: ["partners"],
  pagination: (input: { page: number; searchField: string | undefined }) => [
    keyPartners.gets[0],
    { page: input.page, searchField: input.searchField },
  ],
  get_by_manager: (managerId: string) => [
    keyPartners.gets[0],
    { managerId: managerId },
  ],
} as const;

export function useGetPartners(input: InputGetPartnerByPageService) {
  return useQuery({
    queryKey: keyPartners.pagination({
      page: input.page,
      searchField: input.searchField,
    }),
    queryFn: () =>
      GetPartnerByPageService({
        ...input,
      }),
  });
}

/**
 * Uses get partner by manager
 * @param managerId managerId is the userId that is currently use the website
 * @returns
 */
export function useGetPartnerByManager(managerId: string) {
  return useQuery({
    queryKey: keyPartners.get_by_manager(managerId),
    queryFn: () => GetPartnerByMangegerService(),
  });
}
