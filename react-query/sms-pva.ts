import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CreateSMSPVAService,
  GetAllPricePVAService,
  GetAvailableNumberPVAService,
  GetSMSPVAsService,
  RequestCreateSMSPVAService,
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

export function useCreateSmsPva() {
  return useMutation({
    mutationKey: ["create-sms-pva"],
    mutationFn: (request: RequestCreateSMSPVAService) =>
      CreateSMSPVAService(request),
  });
}
