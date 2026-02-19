import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  GetAllDomainsByPage,
  InputGetAllDomainsByPage,
  InputSummitSitemapDomainService,
  InputVerifyDomainOnGoogleService,
  SummitSitemapDomainService,
  VerifyDomainOnGoogleService,
} from "../services/admin/domain";

const keyDomains = {
  verify: ["verify-domain"],
  summit_sitemap: ["summit-sitemap"],
  domains: ["domains"],
  domains_page: (input: {
    page: number;
    searchField: string;
    selectPartnerId: string | undefined;
  }) => [
    keyDomains.domains[0],
    {
      page: input.page,
      searchField: input.searchField,
      partnerId: input.selectPartnerId,
      filter:
        input.selectPartnerId === "no-partner"
          ? "no-partner"
          : input.selectPartnerId === "no-landing-page"
            ? "no-landing-page"
            : input.selectPartnerId === "all"
              ? "all"
              : undefined,
    },
  ],
} as const;

export function useGetDomainsByPage(request: InputGetAllDomainsByPage) {
  return useQuery({
    queryKey: keyDomains.domains_page({
      page: request.page,
      searchField: request.searchField ?? "",
      selectPartnerId: request.partnerId,
    }),
    queryFn: () => GetAllDomainsByPage(request),
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
    refetchInterval: 1000 * 60,
  });
}

export function useVerifyDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: keyDomains.verify,
    mutationFn: (request: InputVerifyDomainOnGoogleService) =>
      VerifyDomainOnGoogleService(request),

    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: keyDomains.domains,
      });
    },
  });
}

export function useUpdateSitemap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: keyDomains.verify,
    mutationFn: (request: InputSummitSitemapDomainService) =>
      SummitSitemapDomainService(request),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: keyDomains.domains,
      });
    },
  });
}
