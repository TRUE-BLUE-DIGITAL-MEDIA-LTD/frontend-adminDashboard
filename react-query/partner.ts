import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  GetNewsPartnerLeagueTableService,
  GetPartnerByMangegerService,
  GetPartnerByPageService,
  GetPartnerLeagueTableService,
  InputGetPartnerByPageService,
  RequestGetPartnerLeagueTableService,
} from "../services/admin/partner";
import {
  GetConversionParterReportService,
  GetParterPerformanceByDate,
  GetPartnerSummaryStatsService,
  ReqeustGetConversionParterReportService,
  RequestGetParterPerformancesByDate,
  UpdateBulkExchangeRateService,
} from "../services/everflow/partner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

/**
 * Uses get partner league table
 * @param startDate should be string
 * @param endDate should be string
 * @param country should be string
 * @example
 * useGetPartnerLeagueTable(startDate:"2025-08-01", endDate:"2025-08-20", country:"United States")
 */
export function useGetPartnerLeagueTable(
  input: RequestGetPartnerLeagueTableService,
) {
  return useQuery({
    queryKey: ["league-table", input],
    queryFn: () => GetPartnerLeagueTableService(input),
  });
}

export function useGetNewsPartnerLeagueTable() {
  return useQuery({
    queryKey: ["league-table-news"],
    queryFn: () => GetNewsPartnerLeagueTableService(),
    refetchInterval: 1000 * 60,
  });
}

export function useGetConversionPartnerReport(
  input: ReqeustGetConversionParterReportService,
) {
  return useQuery({
    queryKey: ["conversions", input],
    queryFn: () => GetConversionParterReportService(input),
    placeholderData: keepPreviousData,
  });
}

export function useGetPartnerReportByDate(
  input: RequestGetParterPerformancesByDate,
) {
  return useQuery({
    queryKey: ["partner-reports", input],
    queryFn: () => GetParterPerformanceByDate(input),
    placeholderData: keepPreviousData,
    refetchInterval: 1000 * 5,
  });
}

export function useGetPartnerSummaryStats() {
  return useQuery({
    queryKey: ["partner-summary-stats"],
    queryFn: () => GetPartnerSummaryStatsService(),
    refetchInterval: 1000 * 30,
  });
}

export function useUpdateBulkExchangeRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UpdateBulkExchangeRateService,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["partner-reports"],
      });
    },
  });
}
