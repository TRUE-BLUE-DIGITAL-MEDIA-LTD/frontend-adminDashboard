import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CreateSMSPVAService,
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

export function useCreateSmsPva() {
  return useMutation({
    mutationKey: ["create-sms-pva"],
    mutationFn: (request: RequestCreateSMSPVAService) =>
      CreateSMSPVAService(request),
  });
}
