import { useMutation } from "@tanstack/react-query";
import {
  CreateReportOnSimCardService,
  DeleteReportOnSimCardService,
  RequestCreateReportOnSimCardService,
  RequestDeleteReportOnSimCardService,
} from "../services/simCard/reportOnSimcard";

export function useCreateReportSimCard() {
  return useMutation({
    mutationKey: ["create-report-simcard"],
    mutationFn: (request: RequestCreateReportOnSimCardService) =>
      CreateReportOnSimCardService(request),
  });
}

export function useDeleteReportSimCard() {
  return useMutation({
    mutationKey: ["delete-report-simcard"],
    mutationFn: (request: RequestDeleteReportOnSimCardService) =>
      DeleteReportOnSimCardService(request),
  });
}
