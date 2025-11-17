import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSmsReport,
  findAllSmsReport,
  findOneSmsReport,
  removeSmsReport,
  updateSmsReport,
} from "../services/sms-report";
import {
  FindAllSmsReportDto,
  UpdateSmsReportDto,
} from "../models/sms-report.model";

export const useSmsReports = (dto: FindAllSmsReportDto) => {
  return useQuery({
    queryKey: ["sms-reports", dto],
    queryFn: () => findAllSmsReport(dto),
  });
};

export const useSmsReport = (id: string) => {
  return useQuery({
    queryKey: ["sms-reports", id],
    queryFn: () => findOneSmsReport(id),
    enabled: !!id,
  });
};

export const useCreateSmsReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSmsReport,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sms-reports"],
      });
    },
  });
};

export const useUpdateSmsReport = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateSmsReportDto) => updateSmsReport(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sms-reports"],
      });
    },
  });
};

export const useRemoveSmsReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeSmsReport,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sms-reports"],
      });
    },
  });
};
