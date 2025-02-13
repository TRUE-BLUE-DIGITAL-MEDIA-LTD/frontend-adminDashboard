import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BlockSMSPVAService,
  CancelSMSPVAService,
  CreateSMSPVAService,
  GetAllPricePVAService,
  GetAvailableNumberPVAService,
  GetServicePricePVAService,
  GetSMSPVAsService,
  RequestBlockSMSPVAService,
  RequestCancelSMSPVAService,
  RequestCreateSMSPVAService,
  ResponseGetSMSPVAsService,
} from "../services/sms-pva";

export function useGetSmsPva() {
  return useQuery({
    queryKey: ["sms-pva"],
    queryFn: () => GetSMSPVAsService(),
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

export function useGetServicePrice(request: {
  country: string;
  service: string;
}) {
  return useQuery({
    queryKey: ["price", { country: request.country, service: request.service }],
    queryFn: () =>
      GetServicePricePVAService({
        service: request.service,
        country: request.country,
      }),
  });
}

export function useCreateSmsPva() {
  return useMutation({
    mutationKey: ["create-sms-pva"],
    mutationFn: (request: RequestCreateSMSPVAService) =>
      CreateSMSPVAService(request),
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
        (oldData: ResponseGetSMSPVAsService) => {
          return oldData.filter((item) => item.id !== variables.smsPvaId);
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
        (oldData: ResponseGetSMSPVAsService) => {
          return oldData.filter((item) => item.id !== variables.smsPvaId);
        },
      );
    },
  });
}
