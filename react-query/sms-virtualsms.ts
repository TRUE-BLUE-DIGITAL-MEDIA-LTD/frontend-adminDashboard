import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CancelSmsVirtualsmsService,
  CreateSmsVirtualsmsAccountService,
  CreateSmsVirtualsmsService,
  GetCountryListSmsVirtualsmsService,
  GetHistorySmsVirtualsmsService,
  GetServiceListSmsVirtualsmsService,
  GetSmsVirtualsmsAccountsService,
  GetSmsVirtualsmsService,
  RequestCancelSmsVirtualsmsService,
  RequestCreateSmsVirtualsmsAccountService,
  RequestCreateSmsVirtualsmsService,
  RequestGetHistorySmsVirtualsmsService,
  RequestUpdateSmsVirtualsmsAccountService,
  UpdateSmsVirtualsmsAccountService,
} from "../services/sms-virtualsms";
import { userKeys } from "./user";

const itemKeys = {
  item: ["sms-virtualsms"],
  getByUser: (request: { userId: string }) => [
    itemKeys.item[0],
    request.userId,
  ],
} as const;

export function useCreateSmsVirtualsms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (request: RequestCreateSmsVirtualsmsService) =>
      CreateSmsVirtualsmsService(request),
    onSuccess() {
      queryClient.refetchQueries({ queryKey: userKeys.get });
    },
  });
}

export function useGetSmsVirtualsms(request: { userId: string }) {
  return useQuery({
    queryKey: itemKeys.getByUser({ userId: request.userId }),
    queryFn: () => GetSmsVirtualsmsService(),
    refetchInterval: 1000 * 5,
  });
}

export function useCancelSmsVirtualsms() {
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (request: RequestCancelSmsVirtualsmsService) =>
      CancelSmsVirtualsmsService(request),
  });
}

export function useGetSmsVirtualsmsServiceList() {
  return useQuery({
    queryKey: [itemKeys.item[0], "services"],
    queryFn: () => GetServiceListSmsVirtualsmsService(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetSmsVirtualsmsCountryList(request: { service: string }) {
  return useQuery({
    queryKey: [itemKeys.item[0], "countries", request.service],
    queryFn: () => GetCountryListSmsVirtualsmsService(request),
    enabled: request.service.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetHistorySmsVirtualsms(
  request: RequestGetHistorySmsVirtualsmsService,
) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: [itemKeys.item[0], "history", request],
    queryFn: () =>
      GetHistorySmsVirtualsmsService(request).then((res) => {
        queryClient.refetchQueries({ queryKey: userKeys.get });
        return res;
      }),
    refetchInterval: 1000 * 5,
  });
}

export function useGetSmsVirtualsmsAccounts() {
  return useQuery({
    queryKey: [itemKeys.item[0], "accounts"],
    queryFn: () => GetSmsVirtualsmsAccountsService(),
  });
}

export function useCreateSmsVirtualsmsAccount() {
  return useMutation({
    mutationKey: [itemKeys.item[0], "accounts-create"],
    mutationFn: (request: RequestCreateSmsVirtualsmsAccountService) =>
      CreateSmsVirtualsmsAccountService(request),
  });
}

export function useUpdateSmsVirtualsmsAccount() {
  return useMutation({
    mutationKey: [itemKeys.item[0], "accounts-update"],
    mutationFn: (request: RequestUpdateSmsVirtualsmsAccountService) =>
      UpdateSmsVirtualsmsAccountService(request),
  });
}
