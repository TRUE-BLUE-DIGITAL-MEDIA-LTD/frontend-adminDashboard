import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CreateSmsBerryService,
  GetActiveSmsBerryNumbersService,
  RequestCreateSmsBerryService,
  ResponseCreateSmsBerryService,
  ResponseGetActiveSmsBerryNumbersService,
} from "../services/sms-berry";
import { ErrorMessages } from "../models";

export function useGetActiveSmsBerryNumbers() {
  return useQuery<ResponseGetActiveSmsBerryNumbersService, ErrorMessages>({
    queryKey: ["sms-berry", "active-numbers"],
    queryFn: () => GetActiveSmsBerryNumbersService(),
    refetchInterval: 1000 * 5,
  });
}

export function useCreateSmsBerry() {
  return useMutation<
    ResponseCreateSmsBerryService,
    ErrorMessages,
    RequestCreateSmsBerryService
  >({
    mutationFn: (request: RequestCreateSmsBerryService) =>
      CreateSmsBerryService(request),
  });
}
