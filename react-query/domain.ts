import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  DeleteGscSitemapService,
  GetAllDomainsByPage,
  GetDomainGscSitemapsService,
  GetDomainSearchAnalyticsService,
  InputDeleteGscSitemapService,
  InputGetAllDomainsByPage,
  InputGetDomainSearchAnalyticsService,
  InputInspectDomainUrlService,
  InputSummitSitemapDomainService,
  InputUpdateSeoScoreService,
  InputVerifyDomainOnGoogleService,
  InspectDomainUrlService,
  SummitSitemapDomainService,
  UpdateSeoScoreService,
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

export function useUpdateSeoScore() {
  return useMutation({
    mutationKey: ["domain", "seo"],
    mutationFn: (request: InputUpdateSeoScoreService) =>
      UpdateSeoScoreService(request),
  });
}

export function useGetSearchAnalytics(
  request: InputGetDomainSearchAnalyticsService & { enabled?: boolean },
) {
  return useQuery({
    queryKey: [
      "domain-gsc-analytics",
      request.domainId,
      request.startDate,
      request.endDate,
      request.dimension,
    ],
    queryFn: () =>
      GetDomainSearchAnalyticsService({
        domainId: request.domainId,
        startDate: request.startDate,
        endDate: request.endDate,
        dimension: request.dimension,
      }),
    staleTime: 1000 * 60 * 5,
    enabled: request.enabled ?? true,
  });
}

export function useGetGscSitemaps(request: {
  domainId: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["domain-gsc-sitemaps", request.domainId],
    queryFn: () => GetDomainGscSitemapsService({ domainId: request.domainId }),
    staleTime: 1000 * 60 * 5,
    enabled: request.enabled ?? true,
  });
}

export function useInspectUrl() {
  return useMutation({
    mutationKey: ["domain-url-inspection"],
    mutationFn: (request: InputInspectDomainUrlService) =>
      InspectDomainUrlService(request),
  });
}

export function useDeleteGscSitemap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["domain-gsc-sitemap-delete"],
    mutationFn: (request: InputDeleteGscSitemapService) =>
      DeleteGscSitemapService(request),
    onSuccess(data, variables) {
      queryClient.refetchQueries({
        queryKey: ["domain-gsc-sitemaps", variables.domainId],
      });
    },
  });
}
