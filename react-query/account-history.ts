import { useQuery } from "@tanstack/react-query";
import { GetHistoryRecordService } from "../services/history-record";

export const keyHistory = {
  gets: ["histories"],
  pagination: (input: {
    page: number;
    limit: number;
    filter: {
      action: string | undefined;
      data: string | undefined;
      startDate: Date | undefined | null;
      endDate: Date | undefined | null;
      userId: string | undefined;
      sms_oxy: boolean;
    };
  }) => [keyHistory.gets[0], input],
} as const;

export type RequestUseGetHistories = {
  page: number;
  limit: number;
  filter: {
    action: string | undefined;
    data: string | undefined;
    startDate: Date | undefined | null;
    endDate: Date | undefined | null;
    userId: string | undefined;
    sms_oxy: boolean;
  };
};
export function useGetHistories(request: RequestUseGetHistories) {
  return useQuery({
    queryKey: keyHistory.pagination({
      page: request.page,
      limit: request.limit,
      filter: {
        action: request.filter.action,
        data: request.filter.data,
        startDate: request.filter.startDate,
        endDate: request.filter.endDate,
        userId: request.filter.userId,
        sms_oxy: request.filter.sms_oxy,
      },
    }),
    queryFn: () => {
      if (request.filter.startDate && request.filter.endDate) {
        const startDate = new Date(request.filter.startDate);
        const endDate = new Date(request.filter.endDate);
        return GetHistoryRecordService({
          page: request.page,
          limit: request.limit,
          filter: {
            action:
              request.filter.sms_oxy === true
                ? "simcard.update"
                : request.filter.action,
            data: request.filter.data,
            userId: request.filter.userId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            check_usage: request.filter.sms_oxy === true ? "oxy_sms" : "normal",
          },
        });
      } else {
        return GetHistoryRecordService({
          page: request.page,
          limit: request.limit,
          filter: {
            action:
              request.filter.sms_oxy === true
                ? "simcard.update"
                : request.filter.action,
            data: request.filter.data,
            userId: request.filter.userId,
            check_usage: request.filter.sms_oxy === true ? "oxy_sms" : "normal",
          },
        });
      }
    },
  });
}
