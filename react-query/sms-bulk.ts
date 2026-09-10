import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CancelSmsBulkService,
  CompleteSmsBulkService,
  CreateSmsBulkAccountService,
  CreateSmsBulkService,
  GetCountryListSmsBulkService,
  GetHistorySmsBulkService,
  GetServiceListSmsBulkService,
  GetSmsBulkAccountsService,
  GetSmsBulkService,
  RequestCreateSmsBulkAccountService,
  RequestCreateSmsBulkService,
  RequestGetHistorySmsBulkService,
  RequestSmsBulkIdService,
  RequestUpdateSmsBulkAccountService,
  ResendSmsBulkService,
  UpdateSmsBulkAccountService,
} from "../services/sms-bulk";
import { userKeys } from "./user";

export const smsBulkKeys = {
  item: ["sms-bulk"],
  getByUser: (request: { userId: string }) => ["sms-bulk", request.userId],
} as const;

export function useCreateSmsBulk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: smsBulkKeys.item,
    mutationFn: (request: RequestCreateSmsBulkService) =>
      CreateSmsBulkService(request),
    onSuccess() {
      queryClient.refetchQueries({ queryKey: userKeys.get });
    },
  });
}

export function useGetSmsBulk(request: { userId: string }) {
  return useQuery({
    queryKey: smsBulkKeys.getByUser(request),
    queryFn: () => GetSmsBulkService(),
    refetchInterval: 1000 * 5,
  });
}

export function useCancelSmsBulk() {
  return useMutation({
    mutationKey: [smsBulkKeys.item[0], "cancel"],
    mutationFn: (request: RequestSmsBulkIdService) => CancelSmsBulkService(request),
  });
}

export function useCompleteSmsBulk() {
  return useMutation({
    mutationKey: [smsBulkKeys.item[0], "complete"],
    mutationFn: (request: RequestSmsBulkIdService) =>
      CompleteSmsBulkService(request),
  });
}

export function useResendSmsBulk() {
  return useMutation({
    mutationKey: [smsBulkKeys.item[0], "resend"],
    mutationFn: (request: RequestSmsBulkIdService) => ResendSmsBulkService(request),
  });
}

export function useGetSmsBulkServiceList() {
  return useQuery({
    queryKey: [smsBulkKeys.item[0], "services"],
    queryFn: () => GetServiceListSmsBulkService(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetSmsBulkCountryList(request: { service: string }) {
  return useQuery({
    queryKey: [smsBulkKeys.item[0], "countries", request.service],
    queryFn: () => GetCountryListSmsBulkService(request),
    enabled: request.service.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetHistorySmsBulk(request: RequestGetHistorySmsBulkService) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: [smsBulkKeys.item[0], "history", request],
    queryFn: () =>
      GetHistorySmsBulkService(request).then((res) => {
        queryClient.refetchQueries({ queryKey: userKeys.get });
        return res;
      }),
    refetchInterval: 1000 * 5,
  });
}

export function useGetSmsBulkAccounts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [smsBulkKeys.item[0], "accounts"],
    queryFn: () => GetSmsBulkAccountsService(),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateSmsBulkAccount() {
  return useMutation({
    mutationKey: [smsBulkKeys.item[0], "accounts-create"],
    mutationFn: (request: RequestCreateSmsBulkAccountService) =>
      CreateSmsBulkAccountService(request),
  });
}

export function useUpdateSmsBulkAccount() {
  return useMutation({
    mutationKey: [smsBulkKeys.item[0], "accounts-update"],
    mutationFn: (request: RequestUpdateSmsBulkAccountService) =>
      UpdateSmsBulkAccountService(request),
  });
}
