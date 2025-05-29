import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CencelSMSPoolService,
  GetCountrySMSPoolService,
  GetServiceSMSPoolService,
  GetSmsPoolService,
  GetStockNumberService,
  RequestCencelSMSPoolService,
  RequestResendSMSPOOLService,
  RequestReserveSMSPOOLNumberService,
  ResendSMSPOOLService,
  ReserveSMSPOOLNumberService,
} from "../services/sms-pool";

export const smsPoolKeys = {
  getCountry: ["smspool-country"],
  getService: ["smspool-service"],
  getStock: (data: { country: string; service: string }) => [
    "smspool-stock",
    { country: data.country, service: data.service },
  ],
  create: ["smspool-create"],
  get: (data: { userId: string }) => ["smspool-get", { userId: data.userId }],
  cancelSMS: ["smspool-cancel"],
  resend: ["smspool-resend"],
} as const;

export function useGetCountrySMSPool() {
  return useQuery({
    queryKey: smsPoolKeys.getCountry,
    queryFn: () => GetCountrySMSPoolService(),
  });
}

export function useGetServiceSMSPool() {
  return useQuery({
    queryKey: smsPoolKeys.getService,
    queryFn: () => GetServiceSMSPoolService(),
  });
}

export function useGetStockSMSpool(data: { country: string; service: string }) {
  return useQuery({
    queryKey: smsPoolKeys.getStock(data),
    queryFn: () => GetStockNumberService(data),
  });
}

export function useGetSMSPool(data: { userId: string }) {
  return useQuery({
    queryKey: smsPoolKeys.get(data),
    queryFn: () => GetSmsPoolService(),
    refetchInterval: 1000 * 5,
  });
}

export function useCreateSMSPool() {
  return useMutation({
    mutationKey: smsPoolKeys.create,
    mutationFn: (request: RequestReserveSMSPOOLNumberService) =>
      ReserveSMSPOOLNumberService(request),
  });
}

export function useCanelSMSPool() {
  return useMutation({
    mutationKey: smsPoolKeys.cancelSMS,
    mutationFn: (request: RequestCencelSMSPoolService) =>
      CencelSMSPoolService(request),
  });
}

export function useResendSMSPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: smsPoolKeys.resend,
    mutationFn: (request: RequestResendSMSPOOLService) =>
      ResendSMSPOOLService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: smsPoolKeys.get({
          userId: data.userId,
        }),
      });
    },
  });
}
