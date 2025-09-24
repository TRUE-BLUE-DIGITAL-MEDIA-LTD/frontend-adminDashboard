import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CencelSMSPoolService,
  GetCountrySMSPoolService,
  GetHistorySmsPoolService,
  GetServiceSMSPoolService,
  GetSmsPoolService,
  GetStockNumberService,
  RequestCencelSMSPoolService,
  RequestGetHistorySmsPoolService,
  RequestResendSMSPOOLService,
  RequestReserveSMSPOOLNumberService,
  ResendSMSPOOLService,
  ReserveSMSPOOLNumberService,
} from "../services/sms-pool";
import {
  GetSmsPoolAccountsService,
  RequestSwitchSmsPoolAccountsService,
  ResponseGetSmsPoolAccountsService,
  SwitchSmsPoolAccountsService,
} from "../services/sms-pool-account";

export const smsPoolKeys = {
  item: ["sms-pool"],
  getCountry: ["smspool-country"],
  getService: ["smspool-service"],
  getStock: (data: { country: string; service: string; pool: string }) => [
    "smspool-stock",
    { country: data.country, service: data.service, pool: data.pool },
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

export function useGetSmsPoolAccounts() {
  return useQuery({
    queryKey: ["sms-pool-account"],
    queryFn: () => GetSmsPoolAccountsService(),
  });
}

export function useGetHistorySmsPool(input: RequestGetHistorySmsPoolService) {
  return useQuery({
    queryKey: [smsPoolKeys.item[0], input],
    queryFn: () => GetHistorySmsPoolService(input),
  });
}

export function useSwitchSmsPoolAccount(input: { userId: string }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["switch-sms-pool-account"],
    mutationFn: (request: RequestSwitchSmsPoolAccountsService) =>
      SwitchSmsPoolAccountsService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: smsPoolKeys.get({ userId: input.userId }),
      });
      queryClient.setQueryData(
        ["sms-pool-account"],
        (): ResponseGetSmsPoolAccountsService => data,
      );
    },
  });
}

export function useGetStockSMSpool(data: {
  country: string;
  service: string;
  pool: string;
}) {
  return useQuery({
    queryKey: smsPoolKeys.getStock(data),
    queryFn: () => GetStockNumberService(data),
    enabled: !!data.country && !!data.service && !!data.pool,
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
