import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CancelSMSPinverifyService,
  CreateSMSPinverifyService,
  GetHistorySMSPinverifyService,
  GetServiceListSMSPinverifyService,
  GetSMSPinverifyAccountsService,
  GetSMSPinverifyService,
  RequestCancelSMSPinverifyService,
  RequestCreateSMSPinverifyService,
  RequestGetHistorySMSPinverifyService,
  RequestGetServiceListSMSPinverifyService,
  RequestReusedSMSPinverifyService,
  RequestUpdateSMSPinverifyAccountService,
  ReusedSMSPinverifyService,
  UpdateSMSPinverifyAccountService,
} from "../services/sms-pinverify";
import { userKeys } from "./user";

const itemKeys = {
  item: ["sms-pinverify"],
  getByUser: (request: { userId: string }) => [
    itemKeys.item[0],
    request.userId,
  ],
} as const;

export function useCreateSmsPinverify() {
  const queryClinet = useQueryClient();
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (requst: RequestCreateSMSPinverifyService) =>
      CreateSMSPinverifyService(requst),
    onSuccess(data, variables, context) {
      queryClinet.refetchQueries({
        queryKey: userKeys.get,
      });
    },
  });
}

export function useGetSmsPinverify(request: { userId: string }) {
  return useQuery({
    queryKey: itemKeys.getByUser({ userId: request.userId }),
    queryFn: () => GetSMSPinverifyService(),
    refetchInterval: 1000 * 5,
  });
}

export function useReuseSmsPinverify() {
  const queryClinet = useQueryClient();

  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (request: RequestReusedSMSPinverifyService) =>
      ReusedSMSPinverifyService(request),
    onSuccess(data, variables, context) {
      queryClinet.refetchQueries({
        queryKey: userKeys.get,
      });
    },
  });
}

export function useCancelSmsPinverify() {
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (request: RequestCancelSMSPinverifyService) =>
      CancelSMSPinverifyService(request),
  });
}
export function useGetSmsPinverifyServiceList(
  request: RequestGetServiceListSMSPinverifyService,
) {
  return useQuery({
    queryKey: [itemKeys.item[0], "service", request],
    queryFn: () => GetServiceListSMSPinverifyService(request),
  });
}

export function useGetSmsPinverifyAccounts() {
  return useQuery({
    queryKey: [itemKeys.item[0], "accounts"],
    queryFn: () => GetSMSPinverifyAccountsService(),
  });
}
export function useGetHistorySmsPinverify(
  request: RequestGetHistorySMSPinverifyService,
) {
  return useQuery({
    queryKey: [itemKeys.item[0], "history", request],
    queryFn: () => GetHistorySMSPinverifyService(request),
    refetchInterval: 1000 * 5,
  });
}

export function useUpdateSmsPinverifyAccount() {
  return useMutation({
    mutationKey: [itemKeys.item[0], "accounts-update"],
    mutationFn: (request: RequestUpdateSMSPinverifyAccountService) =>
      UpdateSMSPinverifyAccountService(request),
  });
}
