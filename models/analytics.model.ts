export interface LanderAnalyticsRow {
  landingPageId: string;
  landingPageName: string | null;
  domainName: string | null;
  domainId: string | null;
  percent: number | null; // current traffic-split weight
  views: number;
  clicks: number;
  returningViews: number;
  identifiedViews: number;
  ctr: number; // 0..1
  bounceRate: number; // 0..1
  avgTimeOnPageMs: number | null;
  avgMaxScrollPct: number | null;
}

export interface AnalyticsFunnelStep {
  stepId: string;
  label: string | null;
  count: number;
}

export interface LanderAnalyticsDetail {
  landingPageId: string;
  landingPageName: string | null;
  domainName: string | null;
  views: number;
  clicks: number;
  bounceRate: number;
  identifiedViews: number;
  returningViews: number;
  exitBreakdown: { exitType: string; count: number }[];
  devices: { device: string; count: number }[];
  countries: { country: string | null; count: number }[];
  referrers: { referrer: string | null; count: number }[];
  funnel: AnalyticsFunnelStep[];
  funnelSampled: boolean;
}
