export interface Domain {
  id: string;
  createAt: Date;
  updateAt: Date;
  name: string;
  note: string;
  googleAnalyticsId: string;
  netlify_siteId: string;
  netlify_dns_zoneId: string;
  dns_servers: string[];
  google_domain_id: string | null;
  sitemap_status: "NOT_FOUND" | "PEDDING" | "COMPLETED";
  mailEnabled: boolean;
  seoScoreDesktop?: number;
  accessibilityScoreDesktop?: number;
  bestPracticesScoreDesktop?: number;
  performanceScoreDesktop?: number;

  seoScoreMobile?: number;
  accessibilityScoreMobile?: number;
  bestPracticesScoreMobile?: number;
  performanceScoreMobile?: number;

  worstLoadMs?: number | null;
  speedFailedRegions?: number | null;
  speedProbedAt?: string | null;
}

export type DomainListSort = "name" | "load-desc" | "load-asc";

export type SpeedProbeStatus = "OK" | "FAILED";

export interface RegionLatest {
  region: string;
  status: SpeedProbeStatus | null;
  httpStatus: number | null;
  ttfbMs: number | null;
  domContentLoadedMs: number | null;
  loadMs: number | null;
  lcpMs: number | null;
  error: string | null;
  probedAt: string | null;
}

export interface ResponseGetDomainSpeed {
  latest: RegionLatest[];
  history: { region: string; points: { probedAt: string; loadMs: number | null }[] }[];
  worstLoadMs: number | null;
  speedFailedRegions: number | null;
  speedProbedAt: string | null;
}

export type SiteBuild = {
  siteId: string;
  id: string;
  deploy_id: string;
  sha: string;
  done: boolean;
  error: null;
  created_at: string;
  deploy_state: "enqueued" | "ready" | "building" | "error" | "new";
  deploy_pending_review_reason: string;
};
