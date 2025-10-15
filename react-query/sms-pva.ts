import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BlockSMSPVAService,
  CancelSMSPVAService,
  CreateSMSPVAService,
  GetAllPricePVAService,
  GetAvailableNumberPVAService,
  GetByPagePVAService,
  GetServicePricePVAService,
  GetSMSPVAsService,
  RequestBlockSMSPVAService,
  RequestCancelSMSPVAService,
  RequestCreateSMSPVAService,
  RequestGetByPagePVAService,
  RequestGetServicePricePVAService,
  RequestGetSMSPvaService,
  ResponseGetSMSPVAsService,
} from "../services/sms-pva";
import { userKeys } from "./user";

export function useGetSmsPva(request: RequestGetSMSPvaService) {
  return useQuery({
    queryKey: ["sms-pva"],
    queryFn: () => GetSMSPVAsService(request),
    refetchInterval: 5000,
  });
}

export function useGetAllPricePVA() {
  return useQuery({
    queryKey: ["all-price-pva"],
    queryFn: () => GetAllPricePVAService(),
  });
}

export function useGetAvailableNumberPVA(request: { country: string }) {
  return useQuery({
    queryKey: ["available-number-pva", { country: request.country }],
    queryFn: () => GetAvailableNumberPVAService(request),
  });
}

export function useGetByPageSmsPva(request: RequestGetByPagePVAService) {
  return useQuery({
    queryKey: ["sms-pvas", request],
    queryFn: () => GetByPagePVAService(request),
  });
}

export function useGetServicePrice(request: RequestGetServicePricePVAService) {
  return useQuery({
    queryKey: ["price", { country: request.country, service: request.service }],
    queryFn: () => GetServicePricePVAService(request),
  });
}

export function useCreateSmsPva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-sms-pva"],
    mutationFn: (request: RequestCreateSMSPVAService) =>
      CreateSMSPVAService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: userKeys.get,
      });
    },
  });
}

export function useCancelSmsPva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cancel-sms-pva"],
    mutationFn: (input: RequestCancelSMSPVAService) =>
      CancelSMSPVAService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["sms-pva"],
        (oldData: ResponseGetSMSPVAsService): ResponseGetSMSPVAsService => {
          return {
            sims: oldData.sims.filter((item) => item.id !== variables.smsPvaId),
            balance: oldData.balance,
            limit: oldData.limit,
            totalUsage: oldData.totalUsage,
          };
        },
      );
    },
  });
}

export function useBlockSmsPva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["block-sms-pva"],
    mutationFn: (input: RequestBlockSMSPVAService) => BlockSMSPVAService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["sms-pva"],
        (oldData: ResponseGetSMSPVAsService): ResponseGetSMSPVAsService => {
          return {
            balance: oldData.balance,
            sims: oldData.sims.filter((item) => item.id !== variables.smsPvaId),
            limit: oldData.limit,
            totalUsage: oldData.totalUsage,
          };
        },
      );
    },
  });
}
