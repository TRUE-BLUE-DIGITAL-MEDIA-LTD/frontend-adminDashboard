import { useMutation } from "@tanstack/react-query";
import {
  AutoGetICCIDNumberService,
  InputAutoGetICCIDNumberService,
} from "../services/simCard/simCard";

export function useAutoGETICCID() {
  return useMutation({
    mutationKey: ["auto-get-iccid"],
    mutationFn: (request: InputAutoGetICCIDNumberService) =>
      AutoGetICCIDNumberService(request),
  });
}
