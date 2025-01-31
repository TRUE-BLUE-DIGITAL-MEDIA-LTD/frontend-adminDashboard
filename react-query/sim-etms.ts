import { useMutation } from "@tanstack/react-query";
import {
  AutoGetICCIDNumberService,
  CreateSimCardService,
  InputAutoGetICCIDNumberService,
  InputCreateSimCardService,
} from "../services/simCard/simCard";

export function useAutoGETICCID() {
  return useMutation({
    mutationKey: ["auto-get-iccid"],
    mutationFn: (request: InputAutoGetICCIDNumberService) =>
      AutoGetICCIDNumberService(request),
  });
}

export function useCreateSimCard() {
  return useMutation({
    mutationKey: ["create-sim-card"],
    mutationFn: (request: InputCreateSimCardService) =>
      CreateSimCardService(request),
  });
}
