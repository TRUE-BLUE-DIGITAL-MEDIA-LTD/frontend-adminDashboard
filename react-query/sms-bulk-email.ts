import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CancelSmsBulkEmailService,
  CompleteSmsBulkEmailService,
  CreateSmsBulkEmailService,
  GetDomainsSmsBulkEmailService,
  GetHistorySmsBulkEmailService,
  GetSmsBulkEmailService,
  ReorderSmsBulkEmailService,
  RequestCreateSmsBulkEmailService,
  RequestGetHistorySmsBulkEmailService,
  RequestSmsBulkEmailIdService,
} from "../services/sms-bulk-email";
import { userKeys } from "./user";

const keys = { item: ["sms-bulk-email"] } as const;

export function useCreateSmsBulkEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: keys.item,
    mutationFn: (request: RequestCreateSmsBulkEmailService) =>
      CreateSmsBulkEmailService(request),
    onSuccess() {
      queryClient.refetchQueries({ queryKey: userKeys.get });
    },
  });
}

export function useGetSmsBulkEmail(request: { userId: string }) {
  return useQuery({
    queryKey: [keys.item[0], request.userId],
    queryFn: () => GetSmsBulkEmailService(),
    refetchInterval: 1000 * 5,
  });
}

export function useCancelSmsBulkEmail() {
  return useMutation({
    mutationKey: [keys.item[0], "cancel"],
    mutationFn: (request: RequestSmsBulkEmailIdService) =>
      CancelSmsBulkEmailService(request),
  });
}

export function useCompleteSmsBulkEmail() {
  return useMutation({
    mutationKey: [keys.item[0], "complete"],
    mutationFn: (request: RequestSmsBulkEmailIdService) =>
      CompleteSmsBulkEmailService(request),
  });
}

export function useReorderSmsBulkEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [keys.item[0], "reorder"],
    mutationFn: (request: RequestSmsBulkEmailIdService) =>
      ReorderSmsBulkEmailService(request),
    onSuccess() {
      queryClient.refetchQueries({ queryKey: userKeys.get });
    },
  });
}

export function useGetSmsBulkEmailDomains(request: { site: string }) {
  return useQuery({
    queryKey: [keys.item[0], "domains", request.site],
    queryFn: () => GetDomainsSmsBulkEmailService(request),
    enabled: request.site.length > 3,
    staleTime: 1000 * 60,
  });
}

export function useGetHistorySmsBulkEmail(
  request: RequestGetHistorySmsBulkEmailService,
) {
  return useQuery({
    queryKey: [keys.item[0], "history", request],
    queryFn: () => GetHistorySmsBulkEmailService(request),
    refetchInterval: 1000 * 5,
  });
}
