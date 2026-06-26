export type LinkAuditStatus =
  | "OK"
  | "MISMATCH"
  | "UNASSIGNED"
  | "NO_SMARTLINK"
  | "ERROR";

export interface LinkFinding {
  location: string;
  expected: string;
  actual: string;
  matched: boolean;
}

export interface LandingPageFinding {
  landingPageId: string;
  landingPageName: string | null;
  percent: number;
  links: LinkFinding[];
  hasMismatch: boolean;
  error?: string;
}

export interface LinkAuditResult {
  id: string;
  domainId: string;
  domainName: string;
  partnerId: string | null;
  partnerName: string | null;
  status: LinkAuditStatus;
  mismatchCount: number;
  landingPageCount: number;
  findings: LandingPageFinding[];
  scannedAt: string;
}

export type DomainAudit = Omit<LinkAuditResult, "id">;
