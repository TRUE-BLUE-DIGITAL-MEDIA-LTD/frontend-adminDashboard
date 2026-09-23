import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CreateDomainService,
  DeleteDomainNameService,
  DeleteGscSitemapService,
  GetAllDomains,
  GetAllDomainsByPage,
  GetDomainGscSitemapsService,
  GetDomainSearchAnalyticsService,
  GetDomainSpeedService,
  GetLanderPublishService,
  InputDeleteGscSitemapService,
  InputGetAllDomainsByPage,
  InputGetDomainSearchAnalyticsService,
  InputInspectDomainUrlService,
  InputLanderPublishService,
  InputProbeDomainSpeedService,
  InputSummitSitemapDomainService,
  InputUpdateSeoScoreService,
  InputVerifyDomainOnGoogleService,
  InspectDomainUrlService,
  ProbeDomainSpeedService,
  RepublishAllLandersService,
  RequestLanderPublishService,
  ResponseGetAllDomains,
  RunSpeedSweepService,
  SummitSitemapDomainService,
  UpdateSeoScoreService,
  VerifyDomainOnGoogleService,
} from "../services/admin/domain";

const keyDomains = {
  verify: ["verify-domain"],
  summit_sitemap: ["summit-sitemap"],
  domains: ["domains"],
  // The unpaginated list behind `GET /admin/domain/get-all`. Lives under the
  // `domains` prefix so every refetch/invalidate of `domains` covers it too.
  all: ["domains", "all"],
  domains_page: (input: {
    page: number;
    searchField: string;
    selectPartnerId: string | undefined;
    sort?: string;
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
      sort: input.sort,
    },
  ],
} as const;

export type DomainOption = { option: string; id: string };

/** Shape the dropdown/search components expect. Use as `select`. */
export const toDomainOptions = (domains: ResponseGetAllDomains): DomainOption[] =>
  domains.map((domain) => ({ option: domain.name, id: domain.id }));

/**
 * Every domain the current user can see, shared by all pages through one
 * query key. Pass `select` to derive a view (e.g. `toDomainOptions`) without
 * changing what is stored in the cache, so pages with different shapes never
 * clobber each other.
 */
export function useGetAllDomains<TData = ResponseGetAllDomains>(options?: {
  select?: (domains: ResponseGetAllDomains) => TData;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: keyDomains.all,
    queryFn: () => GetAllDomains(),
    select: options?.select,
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60,
  });
}

export function useCreateDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["domain", "create"],
    mutationFn: (request: Parameters<typeof CreateDomainService>[0]) =>
      CreateDomainService(request),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: keyDomains.domains });
    },
  });
}

export function useDeleteDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["domain", "delete"],
    mutationFn: (request: Parameters<typeof DeleteDomainNameService>[0]) =>
      DeleteDomainNameService(request),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: keyDomains.domains });
    },
  });
}

export function useGetDomainsByPage(request: InputGetAllDomainsByPage) {
  return useQuery({
    queryKey: keyDomains.domains_page({
      page: request.page,
      searchField: request.searchField ?? "",
      selectPartnerId: request.partnerId,
      sort: request.sort,
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

export function useGetDomainSpeed(domainId: string, refetchIntervalMs?: number) {
  return useQuery({
    queryKey: ["domain", "speed", domainId],
    queryFn: () => GetDomainSpeedService({ domainId }),
    enabled: domainId !== "",
    refetchInterval: refetchIntervalMs,
  });
}

export function useProbeDomainSpeed() {
  return useMutation({
    mutationKey: ["domain", "speed", "probe"],
    mutationFn: (request: InputProbeDomainSpeedService) => ProbeDomainSpeedService(request),
  });
}

export function useRunSpeedSweep() {
  return useMutation({
    mutationKey: ["domain", "speed", "sweep"],
    mutationFn: () => RunSpeedSweepService(),
  });
}

export function useLanderPublish(domainId: string, refetchIntervalMs?: number) {
  return useQuery({
    queryKey: ["domain", "lander-publish", domainId],
    queryFn: () => GetLanderPublishService({ domainId }),
    enabled: domainId !== "",
    refetchInterval: refetchIntervalMs,
  });
}

export function useRequestLanderPublish() {
  return useMutation({
    mutationKey: ["domain", "lander-publish", "request"],
    mutationFn: (request: InputLanderPublishService) => RequestLanderPublishService(request),
  });
}

export function useRepublishAllLanders() {
  return useMutation({
    mutationKey: ["domain", "lander-publish", "all"],
    mutationFn: () => RepublishAllLandersService(),
  });
}
