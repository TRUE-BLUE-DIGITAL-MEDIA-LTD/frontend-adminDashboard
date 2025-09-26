import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CancelSmsDaisyService,
  CreateSmsDaisyService,
  GetHistorySmsDaisyService,
  GetSmsDaisyAccountsService,
  GetSmsDaisyService,
  RequestCancelSmsDaisyService,
  RequestCreateSmsDaisyService,
  RequestGetHistorySmsDaisyService,
  RequestResendSmsDaisyService,
  RequestUpdateSmsDaisyAccountsService,
  ResendSmsDaisyService,
  UpdateSmsDaisyAccountsService,
} from "../services/sms-daisy";

const keys = {
  item: ["sms-daisy"],
} as const;

export function useCreateSmsDaisy() {
  return useMutation({
    mutationKey: [keys.item[0], "create"],
    mutationFn: (request: RequestCreateSmsDaisyService) =>
      CreateSmsDaisyService(request),
  });
}

export function useResendSmsDaisy() {
  return useMutation({
    mutationKey: [keys.item[0], "resend"],
    mutationFn: (request: RequestResendSmsDaisyService) =>
      ResendSmsDaisyService(request),
  });
}

export function useGetSmsDaisy() {
  return useQuery({
    queryKey: [keys.item[0], "current"],
    queryFn: () => GetSmsDaisyService(),
    refetchInterval: 1000 * 5,
  });
}

export function useGetHistorySmsDaisy(
  request: RequestGetHistorySmsDaisyService,
) {
  return useQuery({
    queryKey: [keys.item[0], "history", request],
    queryFn: () => GetHistorySmsDaisyService(request),
    refetchInterval: 1000 * 5,
  });
}

export function useCancelSmsDaisy() {
  return useMutation({
    mutationKey: [keys.item[0], "cancel"],
    mutationFn: (request: RequestCancelSmsDaisyService) =>
      CancelSmsDaisyService(request),
  });
}

export function useGetSmsDaisyAccount() {
  return useQuery({
    queryKey: [keys.item[0], "accounts"],
    queryFn: () => GetSmsDaisyAccountsService(),
  });
}

export function useUpdateSmsDaisyAccount() {
  return useMutation({
    mutationKey: [keys.item[0], "update-account"],
    mutationFn: (request: RequestUpdateSmsDaisyAccountsService) =>
      UpdateSmsDaisyAccountsService(request),
  });
}
