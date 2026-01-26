import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateAdjustLeadRateService,
  DeleteAdjustLeadRateService,
  FindAllAdjustLeadRateService,
  UpdateAdjustLeadRateService,
  CreateAdjustLeadRateDto,
  UpdateAdjustLeadRateDto,
  DeleteAdjustLeadRateDto,
} from "../services/adjust-lead-rate";

export const adjustLeadRateKeys = {
  all: ["adjust-lead-rates"],
} as const;

export function useFindAllAdjustLeadRate() {
  return useQuery({
    queryKey: adjustLeadRateKeys.all,
    queryFn: () => FindAllAdjustLeadRateService(),
  });
}

export function useCreateAdjustLeadRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-adjust-lead-rate"],
    mutationFn: (data: CreateAdjustLeadRateDto) =>
      CreateAdjustLeadRateService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adjustLeadRateKeys.all,
      });
    },
  });
}

export function useUpdateAdjustLeadRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-adjust-lead-rate"],
    mutationFn: (data: UpdateAdjustLeadRateDto) =>
      UpdateAdjustLeadRateService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adjustLeadRateKeys.all,
      });
    },
  });
}

export function useDeleteAdjustLeadRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-adjust-lead-rate"],
    mutationFn: (data: DeleteAdjustLeadRateDto) =>
      DeleteAdjustLeadRateService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adjustLeadRateKeys.all,
      });
    },
  });
}
