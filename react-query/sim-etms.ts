import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AutoGetICCIDNumberService,
  CreateSimCardService,
  GetSimCardByPageService,
  InputAutoGetICCIDNumberService,
  InputCreateSimCardService,
  InputGetSimCardByPageService,
} from "../services/simCard/simCard";

export const simcardKeys = {
  all: ["simcards"] as const,
  page: (input: InputGetSimCardByPageService) => [
    ...simcardKeys.all,
    { ...input } as const,
  ],
} as const;
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

export function useGetSimcards(
  input: InputGetSimCardByPageService,
  key: typeof simcardKeys.all | typeof simcardKeys.page,
) {
  return useQuery({
    queryKey: key as any,
    queryFn: () =>
      GetSimCardByPageService({
        ...input,
      }),
  });
}
