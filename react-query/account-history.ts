import { useQuery } from "@tanstack/react-query";
import {
  GetHistoryRecordService,
  RequestGetHistoryRecordService,
} from "../services/history-record";

export const keyHistory = {
  gets: ["histories"],
  pagination: (input: RequestGetHistoryRecordService) => [
    keyHistory.gets[0],
    input,
  ],
} as const;

export function useGetHistories(request: RequestGetHistoryRecordService) {
  return useQuery({
    queryKey: keyHistory.pagination(request),
    queryFn: () => GetHistoryRecordService(request),
    enabled: !!request.filter.endDate && !!request.filter.startDate,
  });
}
