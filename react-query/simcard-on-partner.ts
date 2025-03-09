import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BulkSimcardOnPartnerService,
  DeleteSimOnPartnerService,
  GetSimOnPartnersByPartnerIdService,
  InputDeleteSimOnPartnerService,
  InputGetSimOnPartnersByPartnerIdService,
  RequestBulkSimcardOnPartnerService,
  ResponseGetSimOnPartnersByPartnerIdService,
} from "../services/simCard/simOnPartner";

export const simcardOnPartnerKey = {
  all: ["simcard-on-partners"] as const,
  partnerId: (partnerId: string) => [...simcardOnPartnerKey.all, { partnerId }],
};
export function useBlukSimcardOnPartner() {
  return useMutation({
    mutationKey: ["bulk-simcard-on-partner"],
    mutationFn: (request: RequestBulkSimcardOnPartnerService) =>
      BulkSimcardOnPartnerService(request),
  });
}

export function useGetSimcardOnPartner(
  request: InputGetSimOnPartnersByPartnerIdService,
) {
  return useQuery({
    queryKey: simcardOnPartnerKey.partnerId(request.partnerId),
    queryFn: () =>
      GetSimOnPartnersByPartnerIdService({
        partnerId: request.partnerId,
      }),
  });
}

export function useDeleteSimcardOnPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-simcard-on-partner"],
    mutationFn: (
      request: InputDeleteSimOnPartnerService & {
        partnerId: string;
      },
    ) => DeleteSimOnPartnerService(request),

    onSuccess(data, variables, context) {
      const oldData =
        queryClient.getQueryData<ResponseGetSimOnPartnersByPartnerIdService>(
          simcardOnPartnerKey.partnerId(variables.partnerId),
        );

      if (oldData) {
        queryClient.setQueryData(
          simcardOnPartnerKey.partnerId(variables.partnerId),
          (
            data: ResponseGetSimOnPartnersByPartnerIdService,
          ): ResponseGetSimOnPartnersByPartnerIdService => {
            return oldData.filter((o) => o.id !== variables.simOnPartnerId);
          },
        );
      }
    },
  });
}
