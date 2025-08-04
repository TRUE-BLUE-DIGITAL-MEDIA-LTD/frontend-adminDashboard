import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CancelTextVerifiedService,
  CreateTextVerifiedService,
  GetListAearCodeOnTextVerifiedService,
  GetListServiceOnTextVerifiedService,
  GetPriceOnTextVerifiedService,
  GetTextVerifiedService,
  GetTextVerifiedsService,
  ReactiveTextVerifiedService,
  ReportTextVerifiedService,
  RequestCancelTextVerifiedService,
  RequestCreateTextVerifiedService,
  RequestGetListServiceOnTextVerifiedService,
  RequestGetPriceOnTextVerifiedService,
  RequestGetTextVerifiedService,
  RequestGetTextVerifiedsService,
  RequestReactiveTextVerifiedService,
  RequestReportTextVerifiedService,
  RequestReusedTextVerifiedService,
  ReusedTextVerifiedService,
} from "../services/sms-textverified";

export function useGetTextverifiedService(
  request: RequestGetListServiceOnTextVerifiedService,
) {
  return useQuery({
    queryKey: ["textverified-services"],
    queryFn: () => GetListServiceOnTextVerifiedService(request),
  });
}

export function useGetTextverifiedAreaCode() {
  return useQuery({
    queryKey: ["textverified-areacode"],
    queryFn: () => GetListAearCodeOnTextVerifiedService(),
  });
}

export function useCreateTextverified() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-textverified"],
    mutationFn: (request: RequestCreateTextVerifiedService) =>
      CreateTextVerifiedService(request),
    onSettled(data, error, variables, context) {
      queryClient.refetchQueries({
        queryKey: keyTextverifieds.get({ isComplete: "non-complete" }),
      });
    },
  });
}

const keyTextverifieds = {
  item: "textverified",
  get: (request: RequestGetTextVerifiedsService) => [
    keyTextverifieds.item,
    { request },
  ],
  getId: (request: RequestGetTextVerifiedService) => [
    keyTextverifieds.item,
    { id: request.smsTextVerifiedId },
  ],
  getPrice: (request: RequestGetPriceOnTextVerifiedService) => [
    `price-${keyTextverifieds.item}`,
    { request },
  ],
} as const;

export function useGetPriceOnVerifiedService(
  request: RequestGetPriceOnTextVerifiedService,
) {
  return useQuery({
    queryKey: keyTextverifieds.getPrice(request),
    queryFn: () => GetPriceOnTextVerifiedService(request),
  });
}

export function useGetTextverifieds(request: RequestGetTextVerifiedsService) {
  return useQuery({
    queryKey: keyTextverifieds.get(request),
    queryFn: () => GetTextVerifiedsService(request),
    refetchInterval: 1000 * 5,
  });
}

export function useGetTextVerifiedId(request: RequestGetTextVerifiedService) {
  return useQuery({
    queryKey: keyTextverifieds.getId(request),
    queryFn: () => GetTextVerifiedService(request),
  });
}

export function useCancelTextVerified() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [`cancel-${keyTextverifieds.item}`],
    mutationFn: (request: RequestCancelTextVerifiedService) =>
      CancelTextVerifiedService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: keyTextverifieds.get({ isComplete: "non-complete" }),
      });
    },
  });
}

export function useReportTextVerified() {
  return useMutation({
    mutationKey: [`report-${keyTextverifieds.item}`],
    mutationFn: (request: RequestReportTextVerifiedService) =>
      ReportTextVerifiedService(request),
  });
}

export function useReactiveTextVerified() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [`reactive-${keyTextverifieds.item}`],
    mutationFn: (request: RequestReactiveTextVerifiedService) =>
      ReactiveTextVerifiedService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: keyTextverifieds.get({ isComplete: "non-complete" }),
      });
    },
  });
}

export function useReusedTextVerified() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [`reused-${keyTextverifieds.item}`],
    mutationFn: (request: RequestReusedTextVerifiedService) =>
      ReusedTextVerifiedService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: keyTextverifieds.get({ isComplete: "non-complete" }),
      });
    },
  });
}
