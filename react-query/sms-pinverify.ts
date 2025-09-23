import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CancelSMSPinverifyService,
  CreateSMSPinverifyService,
  GetServiceListSMSPinverifyService,
  GetSMSPinverifyAccountsService,
  GetSMSPinverifyService,
  RequestCancelSMSPinverifyService,
  RequestCreateSMSPinverifyService,
  RequestGetServiceListSMSPinverifyService,
  RequestReusedSMSPinverifyService,
  RequestUpdateSMSPinverifyAccountService,
  ReusedSMSPinverifyService,
  UpdateSMSPinverifyAccountService,
} from "../services/sms-pinverify";

const itemKeys = {
  item: ["sms-pinverify"],
  getByUser: (request: { userId: string }) => [
    itemKeys.item[0],
    request.userId,
  ],
} as const;

export function useCreateSmsPinverify() {
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (requst: RequestCreateSMSPinverifyService) =>
      CreateSMSPinverifyService(requst),
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
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (request: RequestReusedSMSPinverifyService) =>
      ReusedSMSPinverifyService(request),
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

export function useUpdateSmsPinverifyAccount() {
  return useMutation({
    mutationKey: [itemKeys.item[0], "accounts-update"],
    mutationFn: (request: RequestUpdateSMSPinverifyAccountService) =>
      UpdateSMSPinverifyAccountService(request),
  });
}
