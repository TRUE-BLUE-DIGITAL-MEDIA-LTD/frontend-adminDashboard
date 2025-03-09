import { useQuery } from "@tanstack/react-query";
import {
  GetPartnerByPageService,
  InputGetPartnerByPageService,
} from "../services/admin/partner";

export function useGetPartners(input: InputGetPartnerByPageService) {
  return useQuery({
    queryKey: ["partners", { input }],
    queryFn: () =>
      GetPartnerByPageService({
        ...input,
      }),
  });
}
