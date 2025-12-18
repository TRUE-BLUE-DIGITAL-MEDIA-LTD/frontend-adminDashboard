import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActiveSmsBowerAccountService,
  CancelSmsBowerService,
  CreateSmsBowerService,
  GetActiveSmsBowerNumbersService,
  GetSmsBowerBalanceService,
  GetSmsBowerAccountsService,
  GetSmsBowerPricesService,
  ReportSmsBowerService,
  RequestActiveSmsBowerAccountService,
  RequestCancelSmsBowerService,
  RequestCreateSmsBowerService,
  RequestGetSmsBowerPricesService,
  RequestReportSmsBowerService,
  RequestRequestAnotherCodeSmsBowerService,
  RequestAnotherCodeSmsBowerService,
} from "../services/sms-bower";
import { userKeys } from "./user";

const keys = {
  item: ["sms-bower"],
} as const;

export function useGetActiveSmsBowerNumbers() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: [keys.item[0], "active"],
    queryFn: () => GetActiveSmsBowerNumbersService(),
    refetchInterval: 1000 * 5,
  });
}

export function useGetSmsBowerBalance() {
  return useQuery({
    queryKey: [keys.item[0], "balance"],
    queryFn: () => GetSmsBowerBalanceService(),
  });
}

export function useGetSmsBowerPrices(request: RequestGetSmsBowerPricesService) {
  return useQuery({
    queryKey: [keys.item[0], "prices", request],
    queryFn: () => GetSmsBowerPricesService(request),
    enabled: !!request.country && !!request.service,
  });
}

export function useCreateSmsBower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [keys.item[0], "create"],
    mutationFn: (request: RequestCreateSmsBowerService) =>
      CreateSmsBowerService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: userKeys.get,
      });
      queryClient.refetchQueries({
        queryKey: [keys.item[0], "active"],
      });
    },
  });
}

export function useCancelSmsBower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [keys.item[0], "cancel"],
    mutationFn: (request: RequestCancelSmsBowerService) =>
      CancelSmsBowerService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: userKeys.get,
      });
      queryClient.refetchQueries({
        queryKey: [keys.item[0], "active"],
      });
    },
  });
}

export function useReportSmsBower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [keys.item[0], "report"],
    mutationFn: (request: RequestReportSmsBowerService) =>
      ReportSmsBowerService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: userKeys.get,
      });
      queryClient.refetchQueries({
        queryKey: [keys.item[0], "active"],
      });
    },
  });
}

export function useRequestAnotherCodeSmsBower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [keys.item[0], "request-another-code"],
    mutationFn: (request: RequestRequestAnotherCodeSmsBowerService) =>
      RequestAnotherCodeSmsBowerService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: userKeys.get,
      });
      queryClient.refetchQueries({
        queryKey: [keys.item[0], "active"],
      });
    },
  });
}

export function useGetSmsBowerAccounts() {
  return useQuery({
    queryKey: [keys.item[0], "accounts"],
    queryFn: () => GetSmsBowerAccountsService(),
  });
}

export function useActiveSmsBowerAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [keys.item[0], "active-account"],
    mutationFn: (request: RequestActiveSmsBowerAccountService) =>
      ActiveSmsBowerAccountService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: [keys.item[0], "accounts"],
      });
    },
  });
}
