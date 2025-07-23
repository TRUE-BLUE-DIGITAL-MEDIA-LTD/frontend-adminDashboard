import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AutoReadNewSimService,
  AutoReadOldSimService,
  CreateSimCardService,
  GetSimCardByPageService,
  InputAutoReadNewSimService,
  InputAutoReadOldSimService,
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

export function useAutoReadOld() {
  return useMutation({
    mutationKey: ["auto-read-old"],
    mutationFn: (request: InputAutoReadOldSimService) =>
      AutoReadOldSimService(request),
  });
}

export function useAutoReadNew() {
  return useMutation({
    mutationKey: ["auto-read-new"],
    mutationFn: (request: InputAutoReadNewSimService) =>
      AutoReadNewSimService(request),
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
