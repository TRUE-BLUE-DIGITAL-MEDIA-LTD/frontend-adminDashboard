export interface Domain {
  id: string;
  createAt: Date;
  updateAt: Date;
  name: string;
  note: string;
  googleAnalyticsId: string;
  oxyeyeAnalyticsId: string | null;
  netlify_siteId: string;
  netlify_dns_zoneId: string;
  dns_servers: string[];
  google_domain_id: string | null;
  sitemap_status: "NOT_FOUND" | "PEDDING" | "COMPLETED";
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
