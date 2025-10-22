import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GetTransactionOxyPointsService,
  RefundOxyPointService,
  RequestGetTransactionOxyPointsService,
  RequestTopupOxyPointService,
  RequestTopupWithOutCreditOxyPointService,
  TopupOxyPointService,
  TopupWithOutCreditOxyPointService,
} from "../services/oxypoint";

export function useGetTransacntionOxypoint(
  request: RequestGetTransactionOxyPointsService,
) {
  return useQuery({
    queryKey: ["transacntions", request],
    queryFn: () => GetTransactionOxyPointsService(request),
  });
}
export function useTopupOxypoint() {
  return useMutation({
    mutationKey: ["oxypoint-topup"],
    mutationFn: (request: RequestTopupOxyPointService) =>
      TopupOxyPointService(request),
  });
}

export function useTopupWithOutOxypoint() {
  return useMutation({
    mutationKey: ["oxypoint-topup", "without-credit"],
    mutationFn: (request: RequestTopupWithOutCreditOxyPointService) =>
      TopupWithOutCreditOxyPointService(request),
  });
}

export function useRefundOxypoint() {
  return useMutation({
    mutationKey: ["oxypoint-refund"],
    mutationFn: () => RefundOxyPointService(),
  });
}
